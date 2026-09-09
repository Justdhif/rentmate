import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.provider';
import * as schema from '../database/schema';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Injectable()
export class PropertiesService {
  constructor(
    @Inject(DRIZZLE)
    private db: any,
  ) {}

  async create(ownerId: string, dto: CreatePropertyDto) {
    const { facilities, ...propertyData } = dto;

    const [newProperty] = await this.db
      .insert(schema.properties)
      .values({
        ...propertyData,
        ownerId,
      })
      .returning();

    let createdFacilities: any[] = [];
    if (facilities && facilities.length > 0) {
      const facilityValues = facilities.map((name) => ({
        propertyId: newProperty.id,
        name,
      }));

      createdFacilities = await this.db
        .insert(schema.propertyFacilities)
        .values(facilityValues)
        .returning();
    }

    return {
      ...newProperty,
      facilities: createdFacilities,
      rooms: [],
    };
  }

  async findAll(ownerId: string, userRole: string) {
    const condition =
      userRole === 'ADMIN' ? undefined : eq(schema.properties.ownerId, ownerId);

    const propertyList = await this.db.query.properties.findMany({
      where: condition,
      with: {
        facilities: true,
        rooms: true,
      },
      orderBy: (properties, { desc }) => [desc(properties.createdAt)],
    });

    return propertyList.map((prop: any) => ({
      ...prop,
      totalRooms: prop.rooms ? prop.rooms.length : 0,
      occupiedRooms: prop.rooms
        ? prop.rooms.filter((r: any) => r.status === 'OCCUPIED').length
        : 0,
      availableRooms: prop.rooms
        ? prop.rooms.filter((r: any) => r.status === 'AVAILABLE').length
        : 0,
      maintenanceRooms: prop.rooms
        ? prop.rooms.filter((r: any) => r.status === 'MAINTENANCE').length
        : 0,
    }));
  }

  async findOne(id: string, ownerId: string, userRole: string) {
    const property = await this.db.query.properties.findFirst({
      where: eq(schema.properties.id, id),
      with: {
        facilities: true,
        rooms: true,
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (userRole !== 'ADMIN' && property.ownerId !== ownerId) {
      throw new ForbiddenException('Access denied: You do not own this property');
    }

    return property;
  }

  async update(
    id: string,
    ownerId: string,
    userRole: string,
    dto: UpdatePropertyDto,
  ) {
    await this.findOne(id, ownerId, userRole);

    const { facilities, ...propertyData } = dto;

    const [updated] = await this.db
      .update(schema.properties)
      .set({
        ...propertyData,
        updatedAt: new Date(),
      })
      .where(eq(schema.properties.id, id))
      .returning();

    if (facilities !== undefined) {
      await this.db
        .delete(schema.propertyFacilities)
        .where(eq(schema.propertyFacilities.propertyId, id));

      if (facilities.length > 0) {
        await this.db.insert(schema.propertyFacilities).values(
          facilities.map((name) => ({
            propertyId: id,
            name,
          })),
        );
      }
    }

    return this.findOne(id, ownerId, userRole);
  }

  async remove(id: string, ownerId: string, userRole: string) {
    await this.findOne(id, ownerId, userRole);

    await this.db.delete(schema.properties).where(eq(schema.properties.id, id));

    return {
      success: true,
      message: 'Property deleted successfully',
    };
  }
}
