import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.provider';
import type { DrizzleDB } from '../database/database.provider';
import * as schema from '../database/schema';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { AvatarHelper } from '../common/helpers/avatar.helper';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DRIZZLE)
    private db: DrizzleDB,
    private cloudinaryService: CloudinaryService,
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

    if (user.profile && !user.profile.avatarUrl) {
      user.profile.avatarUrl = AvatarHelper.generateDefaultAvatar(user.id);
    }

    const { passwordHash, refreshTokenHash, ...result } = user;
    return result;
  }

  async findByEmail(email: string, includeSecrets = false) {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.email, email.toLowerCase().trim()),
      with: {
        profile: true,
      },
    });

    if (!user) {
      return null;
    }

    if (user.profile && !user.profile.avatarUrl) {
      user.profile.avatarUrl = AvatarHelper.generateDefaultAvatar(user.id);
    }

    if (!includeSecrets) {
      const { passwordHash, refreshTokenHash, ...safeUser } = user;
      return safeUser as any;
    }

    return user;
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

    const updates: Record<string, any> = { ...dto };

    // If avatarUrl is a base64 DataURL, upload to Cloudinary
    if (dto.avatarUrl && dto.avatarUrl.startsWith('data:image/')) {
      const uploadedUrl = await this.cloudinaryService.uploadBase64(
        dto.avatarUrl,
        'rentmate/avatars',
        `avatar_${userId}`,
      );
      if (uploadedUrl) {
        updates.avatarUrl = uploadedUrl;
      }
    } else if (dto.avatarUrl === '') {
      // Empty string means reset/remove custom avatar
      updates.avatarUrl = null;
    }

    const [updated] = await this.db
      .update(schema.userProfiles)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(schema.userProfiles.userId, userId))
      .returning();

    return updated;
  }

  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<string> {
    const existing = await this.db.query.userProfiles.findFirst({
      where: eq(schema.userProfiles.userId, userId),
    });

    if (!existing) {
      throw new NotFoundException('User profile not found');
    }

    // Upload image buffer to Cloudinary
    const avatarUrl = await this.cloudinaryService.uploadImageBuffer(
      file.buffer,
      'rentmate/avatars',
      `avatar_${userId}`,
    );

    if (!avatarUrl) {
      throw new BadRequestException(
        'Gagal mengunggah foto profil ke Cloudinary. Silakan periksa koneksi atau coba kembali beberapa saat lagi.',
      );
    }

    await this.db
      .update(schema.userProfiles)
      .set({
        avatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(schema.userProfiles.userId, userId));

    return avatarUrl;
  }
}
