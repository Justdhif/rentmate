import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { eq, and, inArray, desc } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.provider';
import type { DrizzleDB } from '../database/database.provider';
import * as schema from '../database/schema';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomQueryDto } from './dto/room-query.dto';
import { PropertiesService } from '../properties/properties.service';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class RoomsService {
  constructor(
    @Inject(DRIZZLE)
    private db: DrizzleDB,
    private propertiesService: PropertiesService,
    private cloudinaryService: CloudinaryService,
    private analyticsService: AnalyticsService,
  ) {}

  private async processPhotos(photos?: string[]): Promise<string[]> {
    if (!photos || photos.length === 0) return [];

    const processed: string[] = [];
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      if (photo && photo.startsWith('data:image/')) {
        const uploadedUrl = await this.cloudinaryService.uploadBase64(
          photo,
          'rentmate/rooms',
          `room_${Date.now()}_${i}`,
        );
        if (uploadedUrl) {
          processed.push(uploadedUrl);
        }
      } else if (photo) {
        processed.push(photo);
      }
    }
    return processed;
  }

  private normalizeFacilities(facilities?: string[]): string[] {
    if (!facilities || !Array.isArray(facilities)) return [];
    return [
      ...new Set(
        facilities
          .map((f) => (typeof f === 'string' ? f.trim() : ''))
          .filter(Boolean),
      ),
    ];
  }

  async create(
    propertyId: string,
    ownerId: string,
    userRole: string,
    dto: CreateRoomDto,
  ) {
    // Verify property and ownership
    const property = await this.propertiesService.findOne(propertyId, ownerId, userRole);

    if (userRole !== 'ADMIN' && property.ownerId !== ownerId) {
      throw new ForbiddenException(
        'Access denied: You do not own this property to add rooms',
      );
    }

    // Check unique room number in this property
    const existing = await this.db.query.rooms.findFirst({
      where: and(
        eq(schema.rooms.propertyId, propertyId),
        eq(schema.rooms.roomNumber, dto.roomNumber.trim()),
      ),
    });

    if (existing) {
      throw new ConflictException(
        `Room number ${dto.roomNumber} already exists in this property`,
      );
    }

    const processedPhotos = await this.processPhotos(dto.photos);

    const [newRoom] = await this.db
      .insert(schema.rooms)
      .values({
        propertyId,
        roomNumber: dto.roomNumber.trim(),
        floor: dto.floor ?? 1,
        roomType: dto.roomType,
        price: dto.price.toString(),
        status: dto.status ?? 'AVAILABLE',
        description: dto.description,
        facilities: this.normalizeFacilities(dto.facilities),
        photos: processedPhotos,
      })
      .returning();

    // Invalidate analytics overview cache so owners see real-time room count updates
    this.analyticsService.clearCache(property.ownerId || ownerId);

    return newRoom;
  }

  async findAllForUser(
    userId: string,
    userRole: string,
    query?: RoomQueryDto,
  ) {
    let propertyIds: string[] = [];
    const conditions: any[] = [];

    if (userRole === 'OWNER') {
      const ownerProperties = await this.db
        .select({ id: schema.properties.id })
        .from(schema.properties)
        .where(eq(schema.properties.ownerId, userId));

      if (!ownerProperties || ownerProperties.length === 0) {
        return [];
      }
      propertyIds = ownerProperties.map((p: any) => p.id);
      conditions.push(inArray(schema.rooms.propertyId, propertyIds));
    } else if (userRole === 'TENANT') {
      // Penyewa yang sedang mencari kamar: tampilkan kamar AVAILABLE secara default jika filter status tidak dispesifikasikan
      if (!query?.status) {
        conditions.push(eq(schema.rooms.status, 'AVAILABLE'));
      }
    }
    // Jika ADMIN, tampilkan seluruh kamar tanpa restriksi properti

    if (query?.status) {
      conditions.push(eq(schema.rooms.status, query.status));
    }

    if (query?.roomType) {
      conditions.push(eq(schema.rooms.roomType, query.roomType));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const findOptions: any = {
      where: whereClause,
      with: {
        property: true,
      },
      orderBy: (rooms: any, { asc }: any) => [
        asc(rooms.propertyId),
        asc(rooms.floor),
        asc(rooms.roomNumber),
      ],
    };

    if (query?.limit) {
      findOptions.limit = query.limit;
    }
    if (query?.skip !== undefined && query.skip > 0) {
      findOptions.offset = query.skip;
    }

    const roomList = await this.db.query.rooms.findMany(findOptions);

    return roomList.map((room: any) => ({
      ...room,
      monthlyPrice: Number(room.price) || 0,
      type: room.roomType || 'STANDARD',
    }));
  }

  async findAllByProperty(
    propertyId: string,
    userId: string,
    userRole: string,
    query: RoomQueryDto,
  ) {
    // Verify property access
    await this.propertiesService.findOne(propertyId, userId, userRole);

    const conditions = [eq(schema.rooms.propertyId, propertyId)];

    if (query.status) {
      conditions.push(eq(schema.rooms.status, query.status));
    }

    if (query.roomType) {
      conditions.push(eq(schema.rooms.roomType, query.roomType));
    }

    const roomList = await this.db.query.rooms.findMany({
      where: and(...conditions),
      with: {
        property: true,
      },
      orderBy: (rooms: any, { asc }: any) => [asc(rooms.floor), asc(rooms.roomNumber)],
    });

    return roomList.map((room: any) => ({
      ...room,
      monthlyPrice: Number(room.price) || 0,
      type: room.roomType || 'STANDARD',
    }));
  }

  async findOne(id: string, userId: string, userRole: string) {
    const room = await this.db.query.rooms.findFirst({
      where: eq(schema.rooms.id, id),
      with: {
        property: true,
        assignments: true,
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (userRole !== 'ADMIN' && room.property.ownerId !== userId) {
      const isAssignedTenant = room.assignments?.some(
        (a: any) => a.tenantId === userId && a.status === 'ACTIVE',
      );
      const isPubliclyAvailable = room.status === 'AVAILABLE';

      if (!isAssignedTenant && !isPubliclyAvailable) {
        throw new ForbiddenException(
          'Access denied: You do not have permission to access this room',
        );
      }
    }

    return room;
  }

  async update(
    id: string,
    ownerId: string,
    userRole: string,
    dto: UpdateRoomDto,
  ) {
    const room = await this.findOne(id, ownerId, userRole);

    if (userRole !== 'ADMIN' && room.property.ownerId !== ownerId) {
      throw new ForbiddenException(
        'Access denied: You do not own the property for this room',
      );
    }

    if (dto.roomNumber && dto.roomNumber.trim() !== room.roomNumber) {
      const existing = await this.db.query.rooms.findFirst({
        where: and(
          eq(schema.rooms.propertyId, room.propertyId),
          eq(schema.rooms.roomNumber, dto.roomNumber.trim()),
        ),
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Room number ${dto.roomNumber} already exists in this property`,
        );
      }
    }

    // State Transition Guard: validate status change against active tenant assignments
    if (dto.status !== undefined && dto.status !== room.status) {
      const activeAssignment = await this.db.query.roomAssignments.findFirst({
        where: and(
          eq(schema.roomAssignments.roomId, id),
          eq(schema.roomAssignments.status, 'ACTIVE'),
        ),
      });

      if (activeAssignment && dto.status === 'AVAILABLE') {
        throw new BadRequestException(
          'Tidak dapat mengubah status kamar menjadi AVAILABLE karena masih terdapat penyewa aktif. Harap akhiri (unassign) kontrak sewa terlebih dahulu.',
        );
      }

      if (!activeAssignment && dto.status === 'OCCUPIED') {
        throw new BadRequestException(
          'Tidak dapat mengubah status kamar menjadi OCCUPIED secara manual tanpa penyewa. Silakan gunakan alur penempatan penyewa (Assign Room).',
        );
      }
    }

    const updateData: Record<string, any> = {
      ...dto,
      updatedAt: new Date(),
    };

    if (dto.roomNumber) {
      updateData.roomNumber = dto.roomNumber.trim();
    }
    if (dto.price !== undefined) {
      updateData.price = dto.price.toString();
    }

    if (dto.photos !== undefined) {
      updateData.photos = await this.processPhotos(dto.photos);
    }

    if (dto.facilities !== undefined) {
      updateData.facilities = this.normalizeFacilities(dto.facilities);
    }

    const [updated] = await this.db
      .update(schema.rooms)
      .set(updateData)
      .where(eq(schema.rooms.id, id))
      .returning();

    // Invalidate analytics overview cache so owners see real-time updates
    this.analyticsService.clearCache(room.property.ownerId || ownerId);

    return updated;
  }

  async remove(id: string, ownerId: string, userRole: string) {
    const room = await this.findOne(id, ownerId, userRole);

    if (userRole !== 'ADMIN' && room.property.ownerId !== ownerId) {
      throw new ForbiddenException(
        'Access denied: You do not own the property for this room',
      );
    }

    // 1. Check if room has active assignments
    const activeAssignment = await this.db.query.roomAssignments.findFirst({
      where: and(
        eq(schema.roomAssignments.roomId, id),
        eq(schema.roomAssignments.status, 'ACTIVE'),
      ),
    });

    if (activeAssignment || room.status === 'OCCUPIED') {
      throw new BadRequestException(
        'Tidak dapat menghapus kamar yang sedang dihuni oleh penyewa aktif. Harap unassign terlebih dahulu.',
      );
    }

    // 2. Check if room has historical payment records (financial audit trail integrity)
    const existingPayment = await this.db.query.payments.findFirst({
      where: eq(schema.payments.roomId, id),
    });

    if (existingPayment) {
      throw new BadRequestException(
        'Tidak dapat menghapus kamar karena terdapat riwayat transaksi pembayaran sewa. Data finansial dilindungi demi integritas audit.',
      );
    }

    // 3. Check if room has active maintenance requests
    const activeMaintenance = await this.db.query.maintenanceRequests.findFirst({
      where: and(
        eq(schema.maintenanceRequests.roomId, id),
        inArray(schema.maintenanceRequests.status, [
          'REPORTED',
          'ASSIGNED',
          'IN_PROGRESS',
        ]),
      ),
    });

    if (activeMaintenance) {
      throw new BadRequestException(
        'Tidak dapat menghapus kamar karena masih terdapat tiket perbaikan aktif yang sedang berjalan. Harap selesaikan atau batalkan tiket perbaikan terlebih dahulu.',
      );
    }

    await this.db.delete(schema.rooms).where(eq(schema.rooms.id, id));

    // Invalidate analytics overview cache so owners see real-time inventory updates
    this.analyticsService.clearCache(room.property.ownerId || ownerId);

    return {
      success: true,
      message: 'Room deleted successfully',
    };
  }
}
