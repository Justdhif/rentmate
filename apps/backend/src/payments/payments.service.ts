import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  UnauthorizedException,
  Inject,
  Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { eq, and, desc, inArray, lt } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.provider';
import type { DrizzleDB } from '../database/database.provider';
import * as schema from '../database/schema';
import { ConfigService } from '@nestjs/config';
import { MidtransService } from './midtrans.service';
import { RoomsService } from '../rooms/rooms.service';
import { PropertiesService } from '../properties/properties.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { MidtransWebhookDto } from './dto/midtrans-webhook.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @Inject(DRIZZLE)
    private db: DrizzleDB,
    private midtransService: MidtransService,
    private roomsService: RoomsService,
    private propertiesService: PropertiesService,
    private usersService: UsersService,
    private mailService: MailService,
    private analyticsService: AnalyticsService,
    private configService: ConfigService,
  ) {}

  async createBill(ownerId: string, userRole: string, dto: CreateBillDto) {
    const room = await this.roomsService.findOne(dto.roomId, ownerId, userRole);

    let targetTenantId: string;

    if (dto.tenantId) {
      targetTenantId = dto.tenantId;

      const tenancy = await this.db.query.roomAssignments.findFirst({
        where: and(
          eq(schema.roomAssignments.roomId, dto.roomId),
          eq(schema.roomAssignments.tenantId, targetTenantId),
        ),
      });

      if (!tenancy) {
        throw new BadRequestException(
          'Penyewa yang dipilih tidak memiliki riwayat penempatan di kamar ini',
        );
      }
    } else {
      const activeAssignment = await this.db.query.roomAssignments.findFirst({
        where: and(
          eq(schema.roomAssignments.roomId, dto.roomId),
          eq(schema.roomAssignments.status, 'ACTIVE'),
        ),
      });

      if (!activeAssignment) {
        throw new BadRequestException(
          'Kamar ini belum memiliki penyewa aktif. Harap tempatkan penyewa terlebih dahulu.',
        );
      }

      targetTenantId = activeAssignment.tenantId;
    }

    const tenantUser = await this.usersService.findById(targetTenantId);
    if (!tenantUser) {
      throw new NotFoundException('Data pengguna penyewa tidak ditemukan');
    }

    if (tenantUser.role !== 'TENANT') {
      throw new BadRequestException(
        `User ${tenantUser.email} memiliki peran '${tenantUser.role}', bukan 'TENANT'`,
      );
    }

    const billAmount = dto.amount !== undefined ? dto.amount : Number(room.price);

    const todayDate = new Date().toISOString().split('T')[0];
    const isPastDue = dto.dueDate < todayDate;
    const initialStatus = isPastDue ? 'OVERDUE' : 'PENDING';

    const [newPayment] = await this.db
      .insert(schema.payments)
      .values({
        roomId: dto.roomId,
        tenantId: targetTenantId,
        amount: billAmount.toString(),
        dueDate: dto.dueDate,
        period:
          dto.period ||
          new Date(dto.dueDate).toLocaleDateString('id-ID', {
            month: 'long',
            year: 'numeric',
          }),
        status: initialStatus,
      })
      .returning();

    // Invalidate analytics overview cache so owners see real-time pending/overdue revenue updates
    this.analyticsService.clearCache(room.property.ownerId || ownerId);

    return {
      ...newPayment,
      room: {
        id: room.id,
        roomNumber: room.roomNumber,
        floor: room.floor,
      },
      tenant: {
        id: tenantUser.id,
        email: tenantUser.email,
        profile: tenantUser.profile,
      },
    };
  }

  async checkout(paymentId: string, tenantId: string) {
    const payment = await this.db.query.payments.findFirst({
      where: eq(schema.payments.id, paymentId),
      with: {
        room: true,
        tenant: {
          with: {
            profile: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Bill / payment not found');
    }

    if (payment.tenantId !== tenantId) {
      throw new ForbiddenException(
        'Access denied: You can only checkout your own bill',
      );
    }

    if (payment.status === 'PAID') {
      throw new BadRequestException('This bill has already been paid');
    }

    // Idempotent reuse: if an active Snap token already exists for this pending bill, reuse it
    if (payment.snapToken && payment.snapRedirectUrl) {
      return {
        paymentId: payment.id,
        amount: payment.amount,
        period: payment.period,
        dueDate: payment.dueDate,
        snapToken: payment.snapToken,
        redirectUrl: payment.snapRedirectUrl,
      };
    }

    const tenantProfile = payment.tenant?.profile;
    const tenantFullName = tenantProfile?.fullName || 'Tenant';
    const tenantEmail = payment.tenant.email;
    const tenantPhone = tenantProfile?.phoneNumber || '';

    const snapResult = await this.midtransService.createSnapTransaction({
      orderId: payment.id,
      grossAmount: Number(payment.amount),
      customer: {
        firstName: tenantFullName,
        email: tenantEmail,
        phone: tenantPhone,
      },
      item: {
        id: payment.roomId,
        name: `Sewa Kamar ${payment.room.roomNumber} (${payment.period || 'Kost'})`,
        price: Number(payment.amount),
        quantity: 1,
      },
    });

    await this.db
      .update(schema.payments)
      .set({
        snapToken: snapResult.token,
        snapRedirectUrl: snapResult.redirectUrl,
        updatedAt: new Date(),
      })
      .where(eq(schema.payments.id, payment.id));

    return {
      paymentId: payment.id,
      amount: payment.amount,
      period: payment.period,
      dueDate: payment.dueDate,
      snapToken: snapResult.token,
      redirectUrl: snapResult.redirectUrl,
    };
  }

  async handleWebhook(dto: MidtransWebhookDto) {
    this.logger.log(`Received Midtrans webhook for order_id: ${dto.order_id}`);

    const isSignatureValid = this.midtransService.verifySignature(
      dto.order_id,
      dto.status_code,
      dto.gross_amount,
      dto.signature_key,
    );

    if (!isSignatureValid) {
      this.logger.warn(
        `Invalid signature key for Midtrans webhook order_id: ${dto.order_id}`,
      );
      throw new UnauthorizedException('Invalid Midtrans signature key');
    }

    const payment = await this.db.query.payments.findFirst({
      where: eq(schema.payments.id, dto.order_id),
      with: {
        invoice: true,
      },
    });

    if (!payment) {
      throw new NotFoundException(
        `Payment record not found for order_id: ${dto.order_id}`,
      );
    }

    // Terminal State Guard: Once a payment is settled as PAID, ignore subsequent delayed webhooks (e.g. pending, expire, deny)
    if (payment.status === 'PAID') {
      this.logger.log(
        `Midtrans webhook: Payment ${payment.id} is already in terminal status PAID. Ignoring non-terminal status update: ${dto.transaction_status}`,
      );
      return {
        success: true,
        message: 'Payment already marked as PAID',
        orderId: payment.id,
        status: 'PAID',
        invoice: payment.invoice,
      };
    }

    const transactionStatus = dto.transaction_status;
    const fraudStatus = dto.fraud_status;

    let targetStatus: 'PAID' | 'PENDING' | 'FAILED' | 'CANCELLED' | 'OVERDUE' = payment.status;

    if (
      transactionStatus === 'capture' ||
      transactionStatus === 'settlement'
    ) {
      if (fraudStatus === 'challenge') {
        targetStatus = 'PENDING';
      } else {
        targetStatus = 'PAID';
      }
    } else if (transactionStatus === 'pending') {
      targetStatus = 'PENDING';
    } else if (
      transactionStatus === 'deny' ||
      transactionStatus === 'expire' ||
      transactionStatus === 'cancel'
    ) {
      targetStatus = transactionStatus === 'cancel' ? 'CANCELLED' : 'FAILED';
    }

    const paidAt =
      targetStatus === 'PAID'
        ? dto.settlement_time
          ? new Date(dto.settlement_time)
          : new Date()
        : null;

    const result = await this.db.transaction(async (tx: any) => {
      await tx
        .update(schema.payments)
        .set({
          status: targetStatus,
          paidAt: paidAt ?? payment.paidAt,
          paymentMethod: dto.payment_type || payment.paymentMethod,
          transactionReference: dto.transaction_id || dto.order_id,
          updatedAt: new Date(),
        })
        .where(eq(schema.payments.id, payment.id));

      let invoice = payment.invoice;

      if (targetStatus === 'PAID') {
        const existingInvoice = await tx.query.paymentInvoices.findFirst({
          where: eq(schema.paymentInvoices.paymentId, payment.id),
        });

        if (!existingInvoice) {
          const now = new Date();
          const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
          const invoiceNumber = `INV-${dateStr}-${payment.id.substring(0, 8).toUpperCase()}`;

          try {
            const [createdInvoice] = await tx
              .insert(schema.paymentInvoices)
              .values({
                paymentId: payment.id,
                invoiceNumber,
              })
              .returning();

            invoice = createdInvoice;
          } catch (err: any) {
            // Concurrent webhook retry fallback
            invoice = await tx.query.paymentInvoices.findFirst({
              where: eq(schema.paymentInvoices.paymentId, payment.id),
            });
          }
        } else {
          invoice = existingInvoice;
        }
      }

      return {
        success: true,
        orderId: payment.id,
        status: targetStatus,
        invoice,
      };
    });

    if (result.status === 'PAID' && result.invoice) {
      // Invalidate analytics overview cache so owners see real-time revenue instantly
      this.analyticsService.clearCache();
      // Fire-and-forget branded email receipt
      this.sendReceiptEmail(payment, result.invoice.invoiceNumber).catch(() => {});
    }

    return result;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleOverduePayments() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const overduePayments = await this.db
        .update(schema.payments)
        .set({
          status: 'OVERDUE',
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(schema.payments.status, 'PENDING'),
            lt(schema.payments.dueDate, today),
          ),
        )
        .returning({ id: schema.payments.id });

      if (overduePayments.length > 0) {
        this.logger.log(
          `Automated Overdue Check: Marked ${overduePayments.length} bills as OVERDUE for date < ${today}`,
        );

        // Kirim email peringatan jatuh tempo resmi secara otomatis
        for (const p of overduePayments) {
          this.sendOverdueEmail(p.id).catch(() => {});
        }
      }
    } catch (err: any) {
      this.logger.error(
        `Error in automated overdue payments cron: ${err.message}`,
      );
    }
  }

  private async sendOverdueEmail(paymentId: string) {
    try {
      const payment = await this.db.query.payments.findFirst({
        where: eq(schema.payments.id, paymentId),
        with: {
          tenant: { with: { profile: true } },
          room: { with: { property: true } },
        },
      });

      if (!payment || !payment.tenant?.email) return;

      const recipientName =
        payment.tenant.profile?.fullName || payment.tenant.email.split('@')[0];
      const formattedAmount = `Rp ${Number(payment.amount || 0).toLocaleString('id-ID')}`;
      const dueDateFormatted = new Date(payment.dueDate).toLocaleDateString(
        'id-ID',
        { dateStyle: 'long' },
      );

      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

      await this.mailService.sendBrandedMail({
        to: payment.tenant.email,
        subject: `Pemberitahuan Tagihan Sewa Jatuh Tempo - Kamar ${payment.room?.roomNumber || ''}`,
        badge: 'Tagihan Jatuh Tempo',
        badgeType: 'warning',
        heading: 'Pemberitahuan Tagihan Sewa Jatuh Tempo',
        subheading: `Halo ${recipientName}, tagihan sewa kost Anda telah melewati batas waktu pembayaran.`,
        contentHtml: `
          <p>Tagihan sewa kost Anda untuk periode <strong>${payment.period || 'Bulan Berjalan'}</strong> telah melewati tanggal jatuh tempo (${dueDateFormatted}).</p>
          <p>Harap segera menyelesaikan pembayaran agar status sewa Anda tetap aktif dan terhindar dari denda atau pembatasan fasilitas.</p>
        `,
        metadata: [
          { label: 'Properti Kos', value: payment.room?.property?.name || 'RentMate Kost' },
          { label: 'Nomor Kamar', value: `Kamar ${payment.room?.roomNumber || '-'}` },
          { label: 'Jumlah Tagihan', value: formattedAmount, isHighlight: true },
          { label: 'Batas Jatuh Tempo', value: dueDateFormatted },
          { label: 'Status Tagihan', value: 'JATUH TEMPO (OVERDUE)' },
        ],
        ctaText: 'Bayar Tagihan Sekarang',
        ctaUrl: `${frontendUrl}/payments`,
        footerNote: 'Jika Anda telah melakukan pembayaran, abaikan email ini atau konfirmasi kepada pemilik kos.',
      });
    } catch (err: any) {
      this.logger.warn(
        `Failed to send overdue reminder email for payment ${paymentId}: ${err.message}`,
      );
    }
  }

  private async sendReceiptEmail(payment: any, invoiceNumber: string) {
    try {
      const tenant =
        payment.tenant || (await this.usersService.findById(payment.tenantId));
      if (!tenant?.email) return;

      const room =
        payment.room ||
        (await this.db.query.rooms.findFirst({
          where: eq(schema.rooms.id, payment.roomId),
          with: { property: true },
        }));

      const recipientName =
        tenant.profile?.fullName || tenant.email.split('@')[0];
      const formattedAmount = `Rp ${Number(payment.amount || 0).toLocaleString('id-ID')}`;

      await this.mailService.sendBrandedMail({
        to: tenant.email,
        subject: `Kuitansi Pembayaran Kost Lunas - ${invoiceNumber}`,
        badge: 'Pembayaran Lunas',
        badgeType: 'success',
        heading: 'Terima Kasih, Pembayaran Anda Berhasil!',
        subheading: `Halo ${recipientName}, tagihan sewa kost Anda telah tercatat LUNAS.`,
        contentHtml: `
          <p>Pembayaran Anda untuk periode sewa <strong>${payment.period || 'Bulan Berjalan'}</strong> telah kami terima dengan sukses.</p>
          <p>Kuitansi pembayaran digital Anda telah diterbitkan secara otomatis dengan nomor referensi resmi di bawah ini.</p>
        `,
        metadata: [
          { label: 'Nomor Invoice', value: invoiceNumber, isHighlight: true },
          { label: 'Properti Kos', value: room?.property?.name || 'RentMate Kost' },
          { label: 'Nomor Kamar', value: `Kamar ${room?.roomNumber || '-'}` },
          { label: 'Jumlah Dibayar', value: formattedAmount, isHighlight: true },
          {
            label: 'Metode Pembayaran',
            value: payment.paymentMethod || 'Midtrans Payment Gateway',
          },
          {
            label: 'Tanggal Lunas',
            value: new Date().toLocaleDateString('id-ID', { dateStyle: 'long' }),
          },
        ],
        ctaText: 'Lihat Tagihan Saya',
        ctaUrl: 'http://localhost:3000/payments',
        footerNote: 'Simpan email ini sebagai bukti pembayaran digital yang sah.',
      });
    } catch (err: any) {
      this.logger.warn(`Failed to send payment receipt email: ${err.message}`);
    }
  }

  async findAll(
    userId: string,
    userRole: string,
    statusFilter?: string,
    pageOptions?: { page?: number; limit?: number; skip?: number },
  ) {
    const findOptions: any = {
      with: {
        room: {
          with: {
            property: true,
          },
        },
        invoice: true,
      },
      orderBy: [desc(schema.payments.createdAt)],
    };

    if (pageOptions?.limit) {
      findOptions.limit = pageOptions.limit;
    }
    if (pageOptions?.skip !== undefined && pageOptions.skip > 0) {
      findOptions.offset = pageOptions.skip;
    }

    if (userRole === 'TENANT') {
      findOptions.where = statusFilter
        ? and(
            eq(schema.payments.tenantId, userId),
            eq(schema.payments.status, statusFilter as any),
          )
        : eq(schema.payments.tenantId, userId);

      return this.db.query.payments.findMany(findOptions);
    }

    // Owner / Admin role: efficient lookup of room IDs
    let roomIds: string[] = [];

    if (userRole === 'ADMIN') {
      findOptions.where = statusFilter
        ? eq(schema.payments.status, statusFilter as any)
        : undefined;
    } else {
      const ownerProperties = await this.db
        .select({ id: schema.properties.id })
        .from(schema.properties)
        .where(eq(schema.properties.ownerId, userId));

      if (!ownerProperties || ownerProperties.length === 0) {
        return [];
      }

      const propertyIds = ownerProperties.map((p: any) => p.id);
      const rooms = await this.db
        .select({ id: schema.rooms.id })
        .from(schema.rooms)
        .where(inArray(schema.rooms.propertyId, propertyIds));

      if (!rooms || rooms.length === 0) {
        return [];
      }

      roomIds = rooms.map((r: any) => r.id);

      findOptions.where = statusFilter
        ? and(
            inArray(schema.payments.roomId, roomIds),
            eq(schema.payments.status, statusFilter as any),
          )
        : inArray(schema.payments.roomId, roomIds);
    }

    findOptions.with.tenant = {
      with: {
        profile: true,
      },
    };

    return this.db.query.payments.findMany(findOptions);
  }

  async findOne(id: string, userId: string, userRole: string) {
    const payment = await this.db.query.payments.findFirst({
      where: eq(schema.payments.id, id),
      with: {
        room: {
          with: {
            property: true,
          },
        },
        tenant: {
          with: {
            profile: true,
          },
        },
        invoice: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment record not found');
    }

    if (userRole === 'TENANT' && payment.tenantId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (
      userRole === 'OWNER' &&
      payment.room.property.ownerId !== userId
    ) {
      throw new ForbiddenException('Access denied: You do not own this property');
    }

    return payment;
  }

  async markPaid(paymentId: string, ownerId: string, userRole: string) {
    const payment = await this.findOne(paymentId, ownerId, userRole);
    if (payment.status === 'PAID') {
      throw new BadRequestException('This payment has already been marked as PAID');
    }

    const [updatedPayment] = await this.db
      .update(schema.payments)
      .set({
        status: 'PAID',
        paidAt: new Date(),
        paymentMethod: payment.paymentMethod || 'MANUAL_TRANSFER',
        updatedAt: new Date(),
      })
      .where(eq(schema.payments.id, paymentId))
      .returning();

    let invoice = payment.invoice;
    if (!invoice) {
      const now = new Date();
      const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
      const invoiceNumber = `INV-${dateStr}-${payment.id.substring(0, 8).toUpperCase()}`;

      const [createdInvoice] = await this.db
        .insert(schema.paymentInvoices)
        .values({
          paymentId: payment.id,
          invoiceNumber,
        })
        .returning();

      invoice = createdInvoice;
    }

    // Invalidate analytics overview cache so owners see real-time revenue instantly
    this.analyticsService.clearCache(ownerId);

    if (invoice) {
      this.sendReceiptEmail(
        { ...updatedPayment, room: payment.room, tenant: payment.tenant },
        invoice.invoiceNumber,
      ).catch(() => {});
    }

    return {
      ...updatedPayment,
      room: payment.room,
      tenant: payment.tenant,
      invoice,
    };
  }
}
