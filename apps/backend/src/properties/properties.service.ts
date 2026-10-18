import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { eq, and, inArray } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.provider';
import type { DrizzleDB } from '../database/database.provider';
import * as schema from '../database/schema';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { calculateRating } from '../common/helpers/rating.helper';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';

@Injectable()
export class PropertiesService {
  constructor(
    @Inject(DRIZZLE)
    private db: DrizzleDB,
    private cloudinaryService: CloudinaryService,
  ) {}

  private async processPhotos(photos?: string[]): Promise<string[]> {
    if (!photos || photos.length === 0) return [];

    const processed: string[] = [];
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      if (photo && photo.startsWith('data:image/')) {
        const uploadedUrl = await this.cloudinaryService.uploadBase64(
          photo,
          'rentmate/properties',
          `prop_${Date.now()}_${i}`,
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

  async create(ownerId: string, dto: CreatePropertyDto) {
    const { facilities, photos, ...propertyData } = dto;
    const processedPhotos = await this.processPhotos(photos);

    return await this.db.transaction(async (tx: any) => {
      const [newProperty] = await tx
        .insert(schema.properties)
        .values({
          ...propertyData,
          photos: processedPhotos,
          ownerId,
        })
        .returning();

      let createdFacilities: any[] = [];
      if (facilities && facilities.length > 0) {
        const uniqueFacilities = Array.from(
          new Set(facilities.map((name) => name.trim())),
        ).filter(Boolean);

        if (uniqueFacilities.length > 0) {
          const facilityValues = uniqueFacilities.map((name) => ({
            propertyId: newProperty.id,
            name,
          }));

          createdFacilities = await tx
            .insert(schema.propertyFacilities)
            .values(facilityValues)
            .returning();
        }
      }

      return {
        ...newProperty,
        facilities: createdFacilities,
        rooms: [],
      };
    });
  }

  async findAll(ownerId: string, userRole: string) {
    const condition =
      userRole === 'ADMIN' ? undefined : eq(schema.properties.ownerId, ownerId);

    const propertyList = await this.db.query.properties.findMany({
      where: condition,
      with: {
        facilities: true,
        rooms: true,
        reviews: true,
      },
      orderBy: (properties, { desc }) => [desc(properties.createdAt)],
    });

    return propertyList.map((prop: any) => {
      const { rating, reviewCount } = calculateRating(prop.reviews);

      return {
        ...prop,
        rating,
        reviewCount,
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
      };
    });
  }

  async findOne(id: string, _userId?: string, _userRole?: string) {
    const property = await this.db.query.properties.findFirst({
      where: eq(schema.properties.id, id),
      with: {
        facilities: true,
        rooms: true,
        reviews: true,
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    const { rating, reviewCount } = calculateRating(property.reviews);

    return {
      ...property,
      rating,
      reviewCount,
    };
  }

  async update(
    id: string,
    ownerId: string,
    userRole: string,
    dto: UpdatePropertyDto,
  ) {
    const property = await this.findOne(id, ownerId, userRole);

    if (userRole !== 'ADMIN' && property.ownerId !== ownerId) {
      throw new ForbiddenException('Access denied: You do not own this property');
    }

    const { facilities, photos, ...propertyData } = dto;
    const updateData: Record<string, any> = {
      ...propertyData,
      updatedAt: new Date(),
    };

    if (photos !== undefined) {
      updateData.photos = await this.processPhotos(photos);
    }

    await this.db.transaction(async (tx: any) => {
      await tx
        .update(schema.properties)
        .set(updateData)
        .where(eq(schema.properties.id, id));

      if (facilities !== undefined) {
        await tx
          .delete(schema.propertyFacilities)
          .where(eq(schema.propertyFacilities.propertyId, id));

        const uniqueFacilities = Array.from(
          new Set(facilities.map((name) => name.trim())),
        ).filter(Boolean);

        if (uniqueFacilities.length > 0) {
          await tx.insert(schema.propertyFacilities).values(
            uniqueFacilities.map((name) => ({
              propertyId: id,
              name,
            })),
          );
        }
      }
    });

    return this.findOne(id, ownerId, userRole);
  }

  async remove(id: string, ownerId: string, userRole: string) {
    const property = await this.findOne(id, ownerId, userRole);

    if (userRole !== 'ADMIN' && property.ownerId !== ownerId) {
      throw new ForbiddenException('Access denied: You do not own this property');
    }

    // 1. Check if any room in this property has active tenant assignments
    const propertyRooms = await this.db
      .select({ id: schema.rooms.id })
      .from(schema.rooms)
      .where(eq(schema.rooms.propertyId, id));

    const roomIds = propertyRooms.map((r: any) => r.id);

    if (roomIds.length > 0) {
      const activeAssignment = await this.db.query.roomAssignments.findFirst({
        where: and(
          inArray(schema.roomAssignments.roomId, roomIds),
          eq(schema.roomAssignments.status, 'ACTIVE'),
        ),
      });

      if (activeAssignment) {
        throw new BadRequestException(
          'Tidak dapat menghapus properti karena masih terdapat penyewa aktif di salah satu kamar. Harap selesaikan atau batalkan penempatan kamar terlebih dahulu.',
        );
      }

      // 2. Check if any room has payment records (financial audit trail integrity)
      const existingPayment = await this.db.query.payments.findFirst({
        where: inArray(schema.payments.roomId, roomIds),
      });

      if (existingPayment) {
        throw new BadRequestException(
          'Tidak dapat menghapus properti karena terdapat riwayat transaksi pembayaran sewa. Data finansial dilindungi demi integritas audit trail.',
        );
      }

      // 3. Check if any room has active maintenance requests
      const activeMaintenance = await this.db.query.maintenanceRequests.findFirst({
        where: and(
          inArray(schema.maintenanceRequests.roomId, roomIds),
          inArray(schema.maintenanceRequests.status, [
            'REPORTED',
            'ASSIGNED',
            'IN_PROGRESS',
          ]),
        ),
      });

      if (activeMaintenance) {
        throw new BadRequestException(
          'Tidak dapat menghapus properti karena masih terdapat tiket perbaikan aktif yang sedang berjalan di salah satu kamar. Harap selesaikan atau batalkan tiket perbaikan terlebih dahulu.',
        );
      }
    }

    await this.db.delete(schema.properties).where(eq(schema.properties.id, id));

    return {
      success: true,
      message: 'Property deleted successfully',
    };
  }
}
