import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { eq, and, desc, inArray, count } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.provider';
import type { DrizzleDB } from '../database/database.provider';
import * as schema from '../database/schema';
import { RoomsService } from '../rooms/rooms.service';
import { PropertiesService } from '../properties/properties.service';
import { UsersService } from '../users/users.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { AssignTechnicianDto } from './dto/assign-technician.dto';
import { ResolveWorkDto } from './dto/resolve-work.dto';
import { MaintenanceQueryDto } from './dto/maintenance-query.dto';

@Injectable()
export class MaintenanceService {
  constructor(
    @Inject(DRIZZLE)
    private db: DrizzleDB,
    private roomsService: RoomsService,
    private propertiesService: PropertiesService,
    private usersService: UsersService,
    private analyticsService: AnalyticsService,
  ) {}

  async createReport(tenantId: string, dto: CreateMaintenanceDto) {
    let targetRoomId: string;

    if (dto.roomId) {
      targetRoomId = dto.roomId;

      // Anti-IDOR: verify that the tenant has an active assignment for this specified room
      const activeAssignment = await this.db.query.roomAssignments.findFirst({
        where: and(
          eq(schema.roomAssignments.roomId, targetRoomId),
          eq(schema.roomAssignments.tenantId, tenantId),
          eq(schema.roomAssignments.status, 'ACTIVE'),
        ),
      });

      if (!activeAssignment) {
        throw new ForbiddenException(
          'Akses ditolak: Anda hanya dapat membuat laporan perbaikan untuk kamar yang sedang aktif Anda sewa.',
        );
      }
    } else {
      const activeAssignment = await this.db.query.roomAssignments.findFirst({
        where: and(
          eq(schema.roomAssignments.tenantId, tenantId),
          eq(schema.roomAssignments.status, 'ACTIVE'),
        ),
      });

      if (!activeAssignment) {
        throw new BadRequestException(
          'Anda belum memiliki kamar sewa aktif untuk mengajukan laporan perbaikan.',
        );
      }

      targetRoomId = activeAssignment.roomId;
    }

    const room = await this.db.query.rooms.findFirst({
      where: eq(schema.rooms.id, targetRoomId),
      with: {
        property: true,
      },
    });

    if (!room) {
      throw new NotFoundException('Target room not found');
    }

    // Generate readable, collision-free ticket number (e.g. MT-20261018-AB12)
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const ticketNumber = `MT-${dateStr}-${randomSuffix}`;

    const [newRequest] = await this.db
      .insert(schema.maintenanceRequests)
      .values({
        ticketNumber,
        roomId: targetRoomId,
        tenantId,
        category: dto.category,
        description: dto.description,
        priority: dto.priority || 'MEDIUM',
        status: 'REPORTED',
      })
      .returning();

    let createdAttachments: any[] = [];
    if (dto.photos && dto.photos.length > 0) {
      const attachmentValues = dto.photos.map((url) => ({
        maintenanceRequestId: newRequest.id,
        fileUrl: url,
        fileType: 'BEFORE',
      }));

      createdAttachments = await this.db
        .insert(schema.maintenanceAttachments)
        .values(attachmentValues)
        .returning();
    }

    // Invalidate analytics overview cache so owners see real-time maintenance counts
    if (room?.property?.ownerId) {
      this.analyticsService.clearCache(room.property.ownerId);
    }

    return {
      ...newRequest,
      attachments: createdAttachments,
      room: {
        id: room.id,
        roomNumber: room.roomNumber,
        propertyName: room.property.name,
      },
    };
  }

  async assignTechnician(
    ticketId: string,
    ownerId: string,
    userRole: string,
    dto: AssignTechnicianDto,
  ) {
    const ticket = await this.findOne(ticketId, ownerId, userRole);

    if (userRole !== 'ADMIN' && ticket.room.property.ownerId !== ownerId) {
      throw new ForbiddenException(
        'Access denied: You do not own the property for this ticket',
      );
    }

    if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
      throw new BadRequestException(
        `Tidak dapat menugaskan teknisi untuk tiket yang sudah dalam status ${ticket.status}`,
      );
    }

    const technician = await this.usersService.findById(dto.technicianId);
    if (!technician) {
      throw new NotFoundException('Technician not found');
    }

    if (technician.role !== 'TECHNICIAN') {
      throw new BadRequestException(
        `User is registered with role '${technician.role}', not 'TECHNICIAN'`,
      );
    }

    const [updated] = await this.db
      .update(schema.maintenanceRequests)
      .set({
        assignedTo: dto.technicianId,
        estimatedCost: dto.estimatedCost ? dto.estimatedCost.toString() : null,
        status: 'ASSIGNED',
        updatedAt: new Date(),
      })
      .where(eq(schema.maintenanceRequests.id, ticketId))
      .returning();

    if (ticket.room?.property?.ownerId) {
      this.analyticsService.clearCache(ticket.room.property.ownerId);
    }

    return this.findOne(ticketId, ownerId, userRole);
  }

  async startWork(ticketId: string, technicianId: string, userRole: string) {
    const ticket = await this.findOne(ticketId, technicianId, userRole);

    if (userRole !== 'ADMIN' && ticket.assignedTo !== technicianId) {
      throw new ForbiddenException(
        'Access denied: You are not assigned to this maintenance job',
      );
    }

    if (ticket.status === 'REPORTED') {
      throw new BadRequestException(
        'Tiket perbaikan belum ditugaskan kepada teknisi secara resmi',
      );
    }

    if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
      throw new BadRequestException(
        `Pekerjaan tidak dapat dimulai kembali karena tiket sudah dalam status ${ticket.status}`,
      );
    }

    if (ticket.status === 'IN_PROGRESS') {
      return {
        success: true,
        message: 'Tiket sudah dalam proses pengerjaan (IN_PROGRESS).',
        data: ticket,
      };
    }

    const [updated] = await this.db
      .update(schema.maintenanceRequests)
      .set({
        status: 'IN_PROGRESS',
        updatedAt: new Date(),
      })
      .where(eq(schema.maintenanceRequests.id, ticketId))
      .returning();

    return {
      success: true,
      message: 'Work started. Status updated to IN_PROGRESS.',
      data: updated,
    };
  }

  async resolveWork(
    ticketId: string,
    technicianId: string,
    userRole: string,
    dto: ResolveWorkDto,
  ) {
    const ticket = await this.findOne(ticketId, technicianId, userRole);

    if (userRole !== 'ADMIN' && ticket.assignedTo !== technicianId) {
      throw new ForbiddenException(
        'Access denied: You are not assigned to this maintenance job',
      );
    }

    if (ticket.status === 'CLOSED') {
      throw new BadRequestException(
        'Tiket perbaikan sudah ditutup dan tidak dapat diselesaikan kembali',
      );
    }

    if (ticket.status === 'REPORTED' || ticket.status === 'ASSIGNED') {
      throw new BadRequestException(
        'Pekerjaan perbaikan harus dimulai terlebih dahulu (status IN_PROGRESS) sebelum diselesaikan',
      );
    }

    await this.db
      .update(schema.maintenanceRequests)
      .set({
        status: 'RESOLVED',
        workSummary: dto.workSummary,
        materialsUsed: dto.materialsUsed || null,
        actualCost: dto.actualCost ? dto.actualCost.toString() : null,
        resolvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.maintenanceRequests.id, ticketId));

    if (dto.photos && dto.photos.length > 0) {
      const afterAttachments = dto.photos.map((url) => ({
        maintenanceRequestId: ticketId,
        fileUrl: url,
        fileType: 'AFTER',
      }));

      await this.db
        .insert(schema.maintenanceAttachments)
        .values(afterAttachments);
    }

    if (ticket.room?.property?.ownerId) {
      this.analyticsService.clearCache(ticket.room.property.ownerId);
    }

    return this.findOne(ticketId, technicianId, userRole);
  }

  async closeTicket(
    ticketId: string,
    ownerId: string,
    userRole: string,
  ) {
    const ticket = await this.findOne(ticketId, ownerId, userRole);

    if (userRole !== 'ADMIN' && ticket.room.property.ownerId !== ownerId) {
      throw new ForbiddenException(
        'Access denied: You do not own the property for this ticket',
      );
    }

    if (ticket.status === 'CLOSED') {
      throw new BadRequestException(
        'Tiket perbaikan ini sudah ditutup sebelumnya',
      );
    }

    const [updated] = await this.db
      .update(schema.maintenanceRequests)
      .set({
        status: 'CLOSED',
        closedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.maintenanceRequests.id, ticketId))
      .returning();

    // Invalidate analytics overview cache so owners see real-time maintenance counts
    this.analyticsService.clearCache(ticket.room?.property?.ownerId || ownerId);

    return {
      success: true,
      message: 'Maintenance ticket closed successfully.',
      data: updated,
    };
  }

  async findAll(userId: string, userRole: string, query: MaintenanceQueryDto) {
    const conditions: any[] = [];

    if (query.status) {
      conditions.push(eq(schema.maintenanceRequests.status, query.status as any));
    }
    if (query.priority) {
      conditions.push(
        eq(schema.maintenanceRequests.priority, query.priority as any),
      );
    }
    if (query.category) {
      conditions.push(eq(schema.maintenanceRequests.category, query.category));
    }
    if (query.roomId) {
      conditions.push(eq(schema.maintenanceRequests.roomId, query.roomId));
    }

    const findOptions: any = {
      where: and(...conditions),
      with: {
        room: {
          with: {
            property: true,
          },
        },
        technician: {
          with: {
            profile: true,
          },
        },
        attachments: true,
      },
      orderBy: [desc(schema.maintenanceRequests.createdAt)],
    };

    if (query?.limit) {
      findOptions.limit = query.limit;
    }
    if (query?.skip !== undefined && query.skip > 0) {
      findOptions.offset = query.skip;
    }

    if (userRole === 'TENANT') {
      conditions.push(eq(schema.maintenanceRequests.tenantId, userId));
      return this.db.query.maintenanceRequests.findMany(findOptions);
    }

    if (userRole === 'TECHNICIAN') {
      conditions.push(eq(schema.maintenanceRequests.assignedTo, userId));
      findOptions.with.tenant = {
        with: {
          profile: true,
        },
      };
      return this.db.query.maintenanceRequests.findMany(findOptions);
    }

    // Owner role
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

    const roomIds = rooms.map((r: any) => r.id);
    conditions.push(inArray(schema.maintenanceRequests.roomId, roomIds));

    findOptions.with.tenant = {
      with: {
        profile: true,
      },
    };

    return this.db.query.maintenanceRequests.findMany(findOptions);
  }

  async findOne(ticketId: string, userId: string, userRole: string) {
    const ticket = await this.db.query.maintenanceRequests.findFirst({
      where: eq(schema.maintenanceRequests.id, ticketId),
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
        technician: {
          with: {
            profile: true,
          },
        },
        attachments: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException('Maintenance ticket not found');
    }

    if (userRole === 'TENANT' && ticket.tenantId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (userRole === 'TECHNICIAN' && ticket.assignedTo !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (
      userRole === 'OWNER' &&
      ticket.room.property.ownerId !== userId
    ) {
      throw new ForbiddenException('Access denied: You do not own this property');
    }

    return ticket;
  }

  async findRoomHistory(roomId: string, userId: string, userRole: string) {
    const room = await this.roomsService.findOne(roomId, userId, userRole);

    return this.db.query.maintenanceRequests.findMany({
      where: eq(schema.maintenanceRequests.roomId, roomId),
      with: {
        attachments: true,
        tenant: {
          with: {
            profile: true,
          },
        },
        technician: {
          with: {
            profile: true,
          },
        },
      },
      orderBy: [desc(schema.maintenanceRequests.createdAt)],
    });
  }
}
