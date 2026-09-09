import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.provider';
import * as schema from '../database/schema';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DRIZZLE)
    private db: any,
  ) {}

  async findById(id: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, id),
      with: {
        profile: true,
      },
    });

    if (!user) {
      return null;
    }

    const { passwordHash, refreshTokenHash, ...result } = user;
    return result;
  }

  async findByEmail(email: string) {
    return this.db.query.users.findFirst({
      where: eq(schema.users.email, email.toLowerCase().trim()),
      with: {
        profile: true,
      },
    });
  }

  async updateRefreshToken(userId: string, refreshTokenHash: string | null) {
    await this.db
      .update(schema.users)
      .set({
        refreshTokenHash,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId));
  }

  async updateLastLogin(userId: string) {
    await this.db
      .update(schema.users)
      .set({
        lastLoginAt: new Date(),
      })
      .where(eq(schema.users.id, userId));
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const existing = await this.db.query.userProfiles.findFirst({
      where: eq(schema.userProfiles.userId, userId),
    });

    if (!existing) {
      throw new NotFoundException('User profile not found');
    }

    const [updated] = await this.db
      .update(schema.userProfiles)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(eq(schema.userProfiles.userId, userId))
      .returning();

    return updated;
  }
}
