import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.provider';
import * as schema from '../database/schema';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomQueryDto } from './dto/room-query.dto';
import { PropertiesService } from '../properties/properties.service';

@Injectable()
export class RoomsService {
  constructor(
    @Inject(DRIZZLE)
    private db: any,
    private propertiesService: PropertiesService,
  ) {}

  async create(
    propertyId: string,
    ownerId: string,
    userRole: string,
    dto: CreateRoomDto,
  ) {
    // Verify property and ownership
    await this.propertiesService.findOne(propertyId, ownerId, userRole);

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
        facilities: dto.facilities ?? [],
        photos: dto.photos ?? [],
      })
      .returning();

    return newRoom;
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

    return this.db.query.rooms.findMany({
      where: and(...conditions),
      orderBy: (rooms, { asc }) => [asc(rooms.floor), asc(rooms.roomNumber)],
    });
  }

  async findOne(id: string, userId: string, userRole: string) {
    const room = await this.db.query.rooms.findFirst({
      where: eq(schema.rooms.id, id),
      with: {
        property: true,
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (userRole !== 'ADMIN' && room.property.ownerId !== userId) {
      // In future, tenant assigned to this room can also view it. For now, check owner
      throw new ForbiddenException(
        'Access denied: You do not have permission to access this room',
      );
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

    const [updated] = await this.db
      .update(schema.rooms)
      .set(updateData)
      .where(eq(schema.rooms.id, id))
      .returning();

    return updated;
  }

  async remove(id: string, ownerId: string, userRole: string) {
    const room = await this.findOne(id, ownerId, userRole);

    if (room.status === 'OCCUPIED') {
      throw new BadRequestException('Cannot delete an occupied room');
    }

    await this.db.delete(schema.rooms).where(eq(schema.rooms.id, id));

    return {
      success: true,
      message: 'Room deleted successfully',
    };
  }
}
