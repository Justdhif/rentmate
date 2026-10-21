import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
  Inject,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq, and, inArray, desc, ne } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.provider';
import type { DrizzleDB } from '../database/database.provider';
import * as schema from '../database/schema';
import { RoomsService } from '../rooms/rooms.service';
import { PropertiesService } from '../properties/properties.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { AssignRoomDto } from './dto/assign-room.dto';
import { UnassignRoomDto } from './dto/unassign-room.dto';
import { InviteTenantDto } from './dto/invite-tenant.dto';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(
    @Inject(DRIZZLE)
    private db: DrizzleDB,
    private roomsService: RoomsService,
    private propertiesService: PropertiesService,
    private usersService: UsersService,
    private mailService: MailService,
    private configService: ConfigService,
    private analyticsService: AnalyticsService,
  ) {}

  async assignRoom(
    roomId: string,
    ownerId: string,
    userRole: string,
    dto: AssignRoomDto,
  ) {
    const room = await this.roomsService.findOne(roomId, ownerId, userRole);

    if (room.status !== 'AVAILABLE') {
      throw new BadRequestException(
        `Room is not available for assignment. Current status: ${room.status}`,
      );
    }

    if (dto.endDate && new Date(dto.endDate) < new Date(dto.startDate)) {
      throw new BadRequestException(
        'Tanggal berakhir sewa (endDate) tidak boleh lebih awal dari tanggal mulai sewa (startDate)',
      );
    }

    const tenantUser = await this.usersService.findByEmail(dto.tenantEmail);
    if (!tenantUser) {
      throw new NotFoundException(
        `No registered user found with email: ${dto.tenantEmail}. Please invite them first or ensure they register.`,
      );
    }

    if (tenantUser.role !== 'TENANT' && tenantUser.role !== 'USER') {
      throw new BadRequestException(
        `User ${dto.tenantEmail} has role '${tenantUser.role}', only 'USER' or 'TENANT' can be assigned to a room.`,
      );
    }

    const monthlyRent = dto.monthlyRent !== undefined
      ? dto.monthlyRent.toString()
      : room.price;

    const assignment = await this.db.transaction(async (tx: any) => {
      // 1. Atomic Compare-And-Swap on room status
      const [updatedRoom] = await tx
        .update(schema.rooms)
        .set({
          status: 'OCCUPIED',
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(schema.rooms.id, roomId),
            eq(schema.rooms.status, 'AVAILABLE'),
          ),
        )
        .returning();

      if (!updatedRoom) {
        throw new ConflictException(
          'Kamar ini baru saja ditempati atau statusnya tidak lagi AVAILABLE.',
        );
      }

      // 2. Concurrency-safe check if tenant already has an active room
      const existingActive = await tx.query.roomAssignments.findFirst({
        where: and(
          eq(schema.roomAssignments.tenantId, tenantUser.id),
          eq(schema.roomAssignments.status, 'ACTIVE'),
        ),
      });

      if (existingActive) {
        throw new ConflictException(
          'Penyewa ini sudah memiliki kamar aktif lain. Akhiri penempatan sebelumnya terlebih dahulu.',
        );
      }

      // 3. Promote USER to TENANT if currently regular user
      if (tenantUser.role === 'USER') {
        await tx
          .update(schema.users)
          .set({ role: 'TENANT', updatedAt: new Date() })
          .where(eq(schema.users.id, tenantUser.id));
      }

      const [newAssignment] = await tx
        .insert(schema.roomAssignments)
        .values({
          roomId,
          tenantId: tenantUser.id,
          startDate: dto.startDate,
          endDate: dto.endDate,
          monthlyRent,
          status: 'ACTIVE',
          notes: dto.notes,
        })
        .returning();

      return newAssignment;
    });

    // Invalidate analytics overview cache so owners see real-time occupancy updates
    this.analyticsService.clearCache(room.property.ownerId || ownerId);

    return {
      ...assignment,
      tenant: {
        id: tenantUser.id,
        email: tenantUser.email,
        profile: tenantUser.profile,
      },
      room: {
        id: room.id,
        roomNumber: room.roomNumber,
        floor: room.floor,
        roomType: room.roomType,
      },
    };
  }

  async unassignRoom(
    roomId: string,
    ownerId: string,
    userRole: string,
    dto: UnassignRoomDto,
  ) {
    const room = await this.roomsService.findOne(roomId, ownerId, userRole);

    const activeAssignment = await this.db.query.roomAssignments.findFirst({
      where: and(
        eq(schema.roomAssignments.roomId, roomId),
        eq(schema.roomAssignments.status, 'ACTIVE'),
      ),
      with: {
        tenant: {
          with: {
            profile: true,
          },
        },
      },
    });

    if (!activeAssignment) {
      throw new NotFoundException('No active room assignment found for this room');
    }

    const todayDate = new Date().toISOString().split('T')[0];
    const endDate = dto.endDate || todayDate;

    const updatedAssignment = await this.db.transaction(async (tx: any) => {
      const [assignmentResult] = await tx
        .update(schema.roomAssignments)
        .set({
          status: 'ENDED',
          endDate,
          notes: dto.notes ? dto.notes : activeAssignment.notes,
          updatedAt: new Date(),
        })
        .where(eq(schema.roomAssignments.id, activeAssignment.id))
        .returning();

      // Update room status back to AVAILABLE
      await tx
        .update(schema.rooms)
        .set({
          status: 'AVAILABLE',
          updatedAt: new Date(),
        })
        .where(eq(schema.rooms.id, roomId));

      // Revert role to USER if no remaining active assignments
      const remainingActive = await tx.query.roomAssignments.findFirst({
        where: and(
          eq(schema.roomAssignments.tenantId, activeAssignment.tenantId),
          eq(schema.roomAssignments.status, 'ACTIVE'),
          ne(schema.roomAssignments.id, activeAssignment.id),
        ),
      });
      if (!remainingActive) {
        await tx
          .update(schema.users)
          .set({ role: 'USER', updatedAt: new Date() })
          .where(eq(schema.users.id, activeAssignment.tenantId));
      }

      return assignmentResult;
    });

    // Invalidate analytics overview cache so owners see real-time occupancy updates
    this.analyticsService.clearCache(room.property.ownerId || ownerId);

    return {
      success: true,
      message: 'Room assignment ended successfully. Room is now AVAILABLE.',
      data: updatedAssignment,
    };
  }

  async unassignByAnyId(
    targetId: string,
    ownerId: string,
    userRole: string,
    dto: UnassignRoomDto,
  ) {
    // 1. Check if targetId is an assignment id
    let assignment = await this.db.query.roomAssignments.findFirst({
      where: and(
        eq(schema.roomAssignments.id, targetId),
        eq(schema.roomAssignments.status, 'ACTIVE'),
      ),
    });

    // 2. If not, check if targetId is a tenantId
    if (!assignment) {
      assignment = await this.db.query.roomAssignments.findFirst({
        where: and(
          eq(schema.roomAssignments.tenantId, targetId),
          eq(schema.roomAssignments.status, 'ACTIVE'),
        ),
      });
    }

    // 3. If not, check if targetId is a roomId
    if (!assignment) {
      assignment = await this.db.query.roomAssignments.findFirst({
        where: and(
          eq(schema.roomAssignments.roomId, targetId),
          eq(schema.roomAssignments.status, 'ACTIVE'),
        ),
      });
    }

    if (!assignment) {
      throw new NotFoundException('No active room assignment found to checkout');
    }

    return this.unassignRoom(assignment.roomId, ownerId, userRole, dto);
  }

  async findAllByOwner(ownerId: string, userRole: string) {
    const properties = await this.propertiesService.findAll(ownerId, userRole);
    if (!properties || properties.length === 0) {
      return [];
    }

    const propertyIds = properties.map((p: any) => p.id);

    const rooms = await this.db.query.rooms.findMany({
      where: inArray(schema.rooms.propertyId, propertyIds),
      with: {
        property: true,
        assignments: {
          with: {
            tenant: {
              with: {
                profile: true,
              },
            },
          },
          orderBy: [desc(schema.roomAssignments.createdAt)],
        },
      },
    });

    const tenantsMap = new Map<string, any>();

    for (const room of rooms) {
      for (const assignment of room.assignments) {
        const tenant = assignment.tenant;
        if (!tenant) continue;

        const roomData = {
          id: room.id,
          roomNumber: room.roomNumber,
          roomType: room.roomType,
          propertyName: room.property.name,
          propertyAddress: room.property.address,
          propertyId: room.property.id,
          monthlyRent: assignment.monthlyRent,
          startDate: assignment.startDate,
          endDate: assignment.endDate ?? null,
          assignmentId: assignment.id,
          assignmentStatus: assignment.status,
        };

        if (!tenantsMap.has(tenant.id)) {
          tenantsMap.set(tenant.id, {
            id: tenant.id,
            email: tenant.email,
            profile: tenant.profile,
            currentRoom: assignment.status === 'ACTIVE' ? roomData : null,
            lastAssignment: assignment.status !== 'ACTIVE' ? roomData : null,
            totalAssignments: 1,
            lastAssignmentStatus: assignment.status,
          });
        } else {
          const record = tenantsMap.get(tenant.id);
          record.totalAssignments += 1;
          // Prefer ACTIVE assignment for currentRoom
          if (assignment.status === 'ACTIVE' && !record.currentRoom) {
            record.currentRoom = roomData;
            record.lastAssignmentStatus = 'ACTIVE';
          }
          // Keep the most recent non-active assignment for ENDED tenants
          if (assignment.status !== 'ACTIVE' && !record.lastAssignment) {
            record.lastAssignment = roomData;
          }
        }
      }
    }

    return Array.from(tenantsMap.values());
  }

  async findTenantById(tenantId: string, ownerId: string, userRole: string) {
    const tenantUser = await this.usersService.findById(tenantId);
    if (!tenantUser) {
      throw new NotFoundException('Tenant not found');
    }

    const assignments = await this.db.query.roomAssignments.findMany({
      where: eq(schema.roomAssignments.tenantId, tenantId),
      with: {
        room: {
          with: {
            property: true,
          },
        },
      },
      orderBy: [desc(schema.roomAssignments.createdAt)],
    });

    if (userRole !== 'ADMIN') {
      const isMyTenant = assignments.some(
        (a: any) => a.room?.property?.ownerId === ownerId,
      );
      if (!isMyTenant) {
        throw new ForbiddenException(
          'Access denied: This tenant is not registered to any of your properties',
        );
      }
    }

    return {
      ...tenantUser,
      assignmentHistory: assignments,
    };
  }

  async getMyRoom(tenantId: string) {
    const activeAssignment = await this.db.query.roomAssignments.findFirst({
      where: and(
        eq(schema.roomAssignments.tenantId, tenantId),
        eq(schema.roomAssignments.status, 'ACTIVE'),
      ),
      with: {
        room: {
          with: {
            property: {
              with: {
                facilities: true,
                owner: {
                  with: {
                    profile: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!activeAssignment) {
      return {
        hasActiveRoom: false,
        message: 'You currently have no active room assignment',
      };
    }

    const prop = activeAssignment.room.property;
    const ownerProfile = prop.owner?.profile;

    return {
      hasActiveRoom: true,
      assignment: {
        id: activeAssignment.id,
        startDate: activeAssignment.startDate,
        endDate: activeAssignment.endDate,
        monthlyRent: activeAssignment.monthlyRent,
        status: activeAssignment.status,
      },
      room: {
        id: activeAssignment.room.id,
        roomNumber: activeAssignment.room.roomNumber,
        floor: activeAssignment.room.floor,
        roomType: activeAssignment.room.roomType,
        facilities: activeAssignment.room.facilities,
        photos: activeAssignment.room.photos,
        description: activeAssignment.room.description,
      },
      property: {
        id: prop.id,
        name: prop.name,
        address: prop.address,
        rules: prop.rules,
        contactInfo: prop.contactInfo,
        facilities: prop.facilities?.map((f: any) => f.name) || [],
        photos: prop.photos,
        owner: {
          name: ownerProfile?.fullName || 'Owner',
          phone: ownerProfile?.phoneNumber || prop.contactInfo,
        },
      },
    };
  }

  async inviteTenant(ownerId: string, userRole: string, dto: InviteTenantDto) {
    let roomInfo: any = null;
    if (dto.roomId) {
      // Validate that the room exists and belongs to this owner
      roomInfo = await this.roomsService.findOne(dto.roomId, ownerId, userRole);
    }

    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      return {
        success: true,
        isRegistered: true,
        message: 'Tenant already has an active RentMate account',
        user: {
          id: existing.id,
          email: existing.email,
          role: existing.role,
        },
      };
    }

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const inviteUrl = `${frontendUrl}/register?email=${encodeURIComponent(dto.email)}&role=TENANT${dto.roomId ? `&roomId=${dto.roomId}` : ''}`;

    // Send branded invitation email
    try {
      await this.mailService.sendBrandedMail({
        to: dto.email,
        subject: `Undangan Menempati Kamar - Kost ${roomInfo?.property?.name || 'RentMate'}`,
        badge: 'Undangan Penghuni',
        badgeType: 'primary',
        heading: 'Selamat Datang di RentMate!',
        subheading: `Halo ${dto.fullName || 'Calon Penghuni'}, pemilik kos mengundang Anda untuk bergabung.`,
        contentHtml: `
          <p>Anda telah didaftarkan sebagai calon penghuni untuk properti <strong>${roomInfo?.property?.name || 'RentMate'}</strong>.</p>
          <p>Silakan buat akun untuk mengonfirmasi data Anda, melihat tagihan sewa, dan mengakses fasilitas layanan kos secara digital.</p>
        `,
        metadata: [
          { label: 'Nama Calon Penghuni', value: dto.fullName || '-' },
          { label: 'Email Terdaftar', value: dto.email },
          ...(roomInfo
            ? [
                { label: 'Properti Kos', value: roomInfo.property?.name || '-' },
                { label: 'Nomor Kamar', value: `Kamar ${roomInfo.roomNumber}` },
                {
                  label: 'Biaya Sewa / Bulan',
                  value: `Rp ${Number(roomInfo.price || 0).toLocaleString('id-ID')}`,
                  isHighlight: true,
                },
              ]
            : []),
        ],
        ctaText: 'Terima Undangan & Buat Akun',
        ctaUrl: inviteUrl,
        footerNote: 'Jika Anda merasa tidak menyewa kamar ini, Anda dapat mengabaikan email undangan ini.',
      });
    } catch (err: any) {
      this.logger.warn(`Failed to send invitation email to ${dto.email}: ${err.message}`);
    }

    return {
      success: true,
      isRegistered: false,
      message: 'Email undangan resmi telah berhasil dikirimkan ke calon penyewa.',
      inviteDetails: {
        email: dto.email,
        fullName: dto.fullName,
        roomId: dto.roomId,
        inviteUrl,
      },
    };
  }
}
