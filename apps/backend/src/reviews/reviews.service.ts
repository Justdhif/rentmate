import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.provider';
import type { DrizzleDB } from '../database/database.provider';
import * as schema from '../database/schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @Inject(DRIZZLE)
    private db: DrizzleDB,
  ) {}

  async create(userId: string, dto: CreateReviewDto) {
    const property = await this.db.query.properties.findFirst({
      where: eq(schema.properties.id, dto.propertyId),
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    // 1. Prevent owners from reviewing their own property
    if (property.ownerId === userId) {
      throw new ForbiddenException(
        'Pemilik properti tidak diizinkan memberikan ulasan pada properti miliknya sendiri',
      );
    }

    // 2. Prevent duplicate reviews by the same user on the same property
    const existingReview = await this.db.query.reviews.findFirst({
      where: and(
        eq(schema.reviews.userId, userId),
        eq(schema.reviews.propertyId, dto.propertyId),
      ),
    });

    if (existingReview) {
      throw new ConflictException(
        'Anda sudah memberikan ulasan untuk properti ini. Silakan perbarui ulasan Anda.',
      );
    }

    // 3. Verify that the user has a rental history (assignment) in this property
    const propertyRooms = await this.db
      .select({ id: schema.rooms.id })
      .from(schema.rooms)
      .where(eq(schema.rooms.propertyId, dto.propertyId));

    const roomIds = propertyRooms.map((r: any) => r.id);
    if (roomIds.length === 0) {
      throw new ForbiddenException(
        'Properti ini belum memiliki kamar terdaftar untuk diulas',
      );
    }

    const tenancyRecord = await this.db.query.roomAssignments.findFirst({
      where: and(
        eq(schema.roomAssignments.tenantId, userId),
        inArray(schema.roomAssignments.roomId, roomIds),
      ),
    });

    if (!tenancyRecord) {
      throw new ForbiddenException(
        'Hanya penyewa yang terdaftar atau pernah menyewa di properti ini yang dapat memberikan ulasan',
      );
    }

    if (dto.roomId) {
      const room = await this.db.query.rooms.findFirst({
        where: eq(schema.rooms.id, dto.roomId),
      });
      if (!room) {
        throw new NotFoundException('Kamar tidak ditemukan');
      }
      if (room.propertyId !== dto.propertyId) {
        throw new BadRequestException(
          'Kamar yang dipilih tidak terdaftar di dalam properti ini',
        );
      }
    }

    const [newReview] = await this.db
      .insert(schema.reviews)
      .values({
        userId,
        propertyId: dto.propertyId,
        roomId: dto.roomId || null,
        rating: dto.rating,
        comment: dto.comment,
      })
      .returning();

    return this.findOne(newReview.id);
  }

  async findOne(id: string) {
    const review = await this.db.query.reviews.findFirst({
      where: eq(schema.reviews.id, id),
      with: {
        user: {
          with: {
            profile: true,
          },
        },
        room: true,
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      userId: review.userId,
      propertyId: review.propertyId,
      roomId: review.roomId,
      roomNumber: review.room?.roomNumber || null,
      roomType: review.room?.roomType || null,
      reviewer: {
        id: review.user?.id,
        name: review.user?.profile?.fullName || review.user?.email || 'Anonymous',
        avatarUrl: review.user?.profile?.avatarUrl || null,
        role: review.user?.role,
      },
    };
  }

  async findByProperty(
    propertyId: string,
    pageOptions?: { limit?: number; skip?: number },
  ) {
    const reviewList = await this.db.query.reviews.findMany({
      where: eq(schema.reviews.propertyId, propertyId),
      with: {
        user: {
          with: {
            profile: true,
          },
        },
        room: true,
      },
      orderBy: (reviews: any, { desc }: any) => [desc(reviews.createdAt)],
    });

    const totalReviews = reviewList.length;

    const distribution: Record<number, number> = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    let totalRating = 0;

    const formattedReviews = reviewList.map((rev: any) => {
      const rating = Math.min(5, Math.max(1, Math.round(Number(rev.rating) || 5)));
      totalRating += rating;
      if (distribution[rating] !== undefined) {
        distribution[rating] += 1;
      }

      return {
        id: rev.id,
        rating: rev.rating,
        comment: rev.comment,
        createdAt: rev.createdAt,
        updatedAt: rev.updatedAt,
        userId: rev.userId,
        propertyId: rev.propertyId,
        roomId: rev.roomId,
        roomNumber: rev.room?.roomNumber || null,
        roomType: rev.room?.roomType || null,
        reviewer: {
          id: rev.user?.id,
          name: rev.user?.profile?.fullName || rev.user?.email || 'Penghuni Kost',
          avatarUrl: rev.user?.profile?.avatarUrl || null,
          role: rev.user?.role,
        },
      };
    });

    const averageRating =
      totalReviews > 0
        ? Math.round((totalRating / totalReviews) * 10) / 10
        : 0;

    const breakdown = [5, 4, 3, 2, 1].map((stars) => {
      const count = distribution[stars] || 0;
      const percentage =
        totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
      return {
        stars,
        count,
        percentage,
      };
    });

    const paginatedReviews = pageOptions?.limit
      ? formattedReviews.slice(
          pageOptions.skip || 0,
          (pageOptions.skip || 0) + pageOptions.limit,
        )
      : formattedReviews;

    return {
      reviews: paginatedReviews,
      summary: {
        averageRating,
        totalReviews,
        breakdown,
      },
    };
  }

  async update(
    id: string,
    userId: string,
    userRole: string,
    dto: UpdateReviewDto,
  ) {
    const existing = await this.db.query.reviews.findFirst({
      where: eq(schema.reviews.id, id),
    });

    if (!existing) {
      throw new NotFoundException('Review not found');
    }

    if (userRole !== 'ADMIN' && existing.userId !== userId) {
      throw new ForbiddenException('You can only update your own review');
    }

    await this.db
      .update(schema.reviews)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(eq(schema.reviews.id, id));

    return this.findOne(id);
  }

  async remove(id: string, userId: string, userRole: string) {
    const existing = await this.db.query.reviews.findFirst({
      where: eq(schema.reviews.id, id),
    });

    if (!existing) {
      throw new NotFoundException('Review not found');
    }

    if (userRole !== 'ADMIN' && existing.userId !== userId) {
      throw new ForbiddenException('You can only delete your own review');
    }

    await this.db.delete(schema.reviews).where(eq(schema.reviews.id, id));

    return {
      success: true,
      message: 'Review deleted successfully',
    };
  }
}
