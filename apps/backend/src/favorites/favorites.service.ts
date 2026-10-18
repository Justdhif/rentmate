import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.provider';
import type { DrizzleDB } from '../database/database.provider';
import * as schema from '../database/schema';
import { ToggleFavoriteDto } from './dto/toggle-favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(
    @Inject(DRIZZLE)
    private db: DrizzleDB,
  ) {}

  async toggle(userId: string, dto: ToggleFavoriteDto) {
    const { propertyId, roomId } = dto;

    if (!propertyId && !roomId) {
      throw new BadRequestException('Either propertyId or roomId must be provided');
    }

    if (propertyId) {
      const property = await this.db.query.properties.findFirst({
        where: eq(schema.properties.id, propertyId),
      });

      if (!property) {
        throw new NotFoundException('Properti tidak ditemukan');
      }

      const existing = await this.db.query.favorites.findFirst({
        where: and(
          eq(schema.favorites.userId, userId),
          eq(schema.favorites.propertyId, propertyId),
        ),
      });

      if (existing) {
        await this.db
          .delete(schema.favorites)
          .where(eq(schema.favorites.id, existing.id));
        return {
          isFavorite: false,
          type: 'property',
          targetId: propertyId,
          message: 'Properti berhasil dihapus dari favorit',
        };
      } else {
        const [inserted] = await this.db
          .insert(schema.favorites)
          .values({
            userId,
            propertyId,
          })
          .returning();
        return {
          isFavorite: true,
          type: 'property',
          targetId: propertyId,
          data: inserted,
          message: 'Properti berhasil ditambahkan ke favorit',
        };
      }
    }

    if (roomId) {
      const room = await this.db.query.rooms.findFirst({
        where: eq(schema.rooms.id, roomId),
      });

      if (!room) {
        throw new NotFoundException('Kamar tidak ditemukan');
      }

      const existing = await this.db.query.favorites.findFirst({
        where: and(
          eq(schema.favorites.userId, userId),
          eq(schema.favorites.roomId, roomId),
        ),
      });

      if (existing) {
        await this.db
          .delete(schema.favorites)
          .where(eq(schema.favorites.id, existing.id));
        return {
          isFavorite: false,
          type: 'room',
          targetId: roomId,
          message: 'Kamar berhasil dihapus dari favorit',
        };
      } else {
        const [inserted] = await this.db
          .insert(schema.favorites)
          .values({
            userId,
            roomId,
          })
          .returning();
        return {
          isFavorite: true,
          type: 'room',
          targetId: roomId,
          data: inserted,
          message: 'Kamar berhasil ditambahkan ke favorit',
        };
      }
    }
  }

  async findAll(userId: string) {
    const userFavorites = await this.db.query.favorites.findMany({
      where: eq(schema.favorites.userId, userId),
      with: {
        property: {
          with: {
            facilities: true,
            rooms: true,
          },
        },
        room: {
          with: {
            property: true,
          },
        },
      },
      orderBy: (favorites: any, { desc }: any) => [desc(favorites.createdAt)],
    });

    const properties = userFavorites
      .filter((fav: any) => Boolean(fav.property))
      .map((fav: any) => ({
        ...fav.property,
        favoriteId: fav.id,
        isFavorite: true,
        favoritedAt: fav.createdAt,
        totalRooms: fav.property?.rooms ? fav.property.rooms.length : 0,
        availableRooms: fav.property?.rooms
          ? fav.property.rooms.filter((r: any) => r.status === 'AVAILABLE').length
          : 0,
      }));

    const rooms = userFavorites
      .filter((fav: any) => Boolean(fav.room))
      .map((fav: any) => ({
        ...fav.room,
        favoriteId: fav.id,
        isFavorite: true,
        favoritedAt: fav.createdAt,
        propertyName: fav.room?.property?.name || '',
      }));

    return {
      properties,
      rooms,
      totalCount: userFavorites.length,
    };
  }

  async getUserFavoriteIds(userId: string) {
    const list = await this.db.query.favorites.findMany({
      where: eq(schema.favorites.userId, userId),
      columns: {
        propertyId: true,
        roomId: true,
      },
    });

    const propertyIds = list
      .map((item: any) => item.propertyId)
      .filter(Boolean);
    const roomIds = list
      .map((item: any) => item.roomId)
      .filter(Boolean);

    return {
      propertyIds,
      roomIds,
    };
  }
}
