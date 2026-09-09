import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  UnauthorizedException,
  Inject,
  Logger,
} from '@nestjs/common';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.provider';
import * as schema from '../database/schema';
import { MidtransService } from './midtrans.service';
import { RoomsService } from '../rooms/rooms.service';
import { PropertiesService } from '../properties/properties.service';
import { UsersService } from '../users/users.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { MidtransWebhookDto } from './dto/midtrans-webhook.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @Inject(DRIZZLE)
    private db: any,
    private midtransService: MidtransService,
    private roomsService: RoomsService,
    private propertiesService: PropertiesService,
    private usersService: UsersService,
  ) {}

  async createBill(ownerId: string, userRole: string, dto: CreateBillDto) {
    const room = await this.roomsService.findOne(dto.roomId, ownerId, userRole);

    let targetTenantId: string;

    if (dto.tenantId) {
      targetTenantId = dto.tenantId;
    } else {
      const activeAssignment = await this.db.query.roomAssignments.findFirst({
        where: and(
          eq(schema.roomAssignments.roomId, dto.roomId),
          eq(schema.roomAssignments.status, 'ACTIVE'),
        ),
      });

      if (!activeAssignment) {
        throw new BadRequestException(
          'Room has no active tenant assigned. Please specify tenantId or assign a tenant first.',
        );
      }

      targetTenantId = activeAssignment.tenantId;
    }

    const tenantUser = await this.usersService.findById(targetTenantId);
    if (!tenantUser) {
      throw new NotFoundException('Tenant user not found');
    }

    const billAmount = dto.amount !== undefined ? dto.amount : Number(room.price);

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
        status: 'PENDING',
      })
      .returning();

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

    const transactionStatus = dto.transaction_status;
    const fraudStatus = dto.fraud_status;

    let targetStatus: 'PAID' | 'PENDING' | 'FAILED' | 'CANCELLED' = payment.status;

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

    await this.db
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

    if (targetStatus === 'PAID' && !invoice) {
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

    return {
      success: true,
      orderId: payment.id,
      status: targetStatus,
      invoice,
    };
  }

  async findAll(userId: string, userRole: string, statusFilter?: string) {
    if (userRole === 'TENANT') {
      return this.db.query.payments.findMany({
        where: statusFilter
          ? and(
              eq(schema.payments.tenantId, userId),
              eq(schema.payments.status, statusFilter as any),
            )
          : eq(schema.payments.tenantId, userId),
        with: {
          room: {
            with: {
              property: true,
            },
          },
          invoice: true,
        },
        orderBy: [desc(schema.payments.createdAt)],
      });
    }

    const properties = await this.propertiesService.findAll(userId, userRole);
    if (!properties || properties.length === 0) {
      return [];
    }

    const propertyIds = properties.map((p: any) => p.id);
    const rooms = await this.db.query.rooms.findMany({
      where: inArray(schema.rooms.propertyId, propertyIds),
    });

    if (!rooms || rooms.length === 0) {
      return [];
    }

    const roomIds = rooms.map((r: any) => r.id);

    return this.db.query.payments.findMany({
      where: statusFilter
        ? and(
            inArray(schema.payments.roomId, roomIds),
            eq(schema.payments.status, statusFilter as any),
          )
        : inArray(schema.payments.roomId, roomIds),
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
      orderBy: [desc(schema.payments.createdAt)],
    });
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
}
