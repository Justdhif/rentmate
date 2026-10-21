import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Inject,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.provider';
import type { DrizzleDB } from '../database/database.provider';
import * as schema from '../database/schema';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { AvatarHelper } from '../common/helpers/avatar.helper';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private googleClient: OAuth2Client;

  constructor(
    @Inject(DRIZZLE)
    private db: DrizzleDB,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private cloudinaryService: CloudinaryService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

  async googleAuth(dto: GoogleAuthDto) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    let payload: any;

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: dto.idToken,
        audience: clientId,
      });
      payload = ticket.getPayload();
    } catch (err: any) {
      this.logger.error(`Google token verification failed: ${err.message}`);
      throw new UnauthorizedException(
        'Verifikasi akun Google gagal. Token tidak valid atau telah kedaluwarsa.',
      );
    }

    if (!payload || !payload.email) {
      throw new UnauthorizedException(
        'Verifikasi akun Google gagal. Informasi akun tidak ditemukan.',
      );
    }

    const email = payload.email.toLowerCase().trim();
    const existingUser = await this.usersService.findByEmail(email, true);

    // Upload foto profil Google ke Cloudinary jika tersedia, fallback ke DiceBear
    let googleAvatarUrl: string | null = null;
    if (payload.picture) {
      const publicId = `google_${payload.sub || email.replace(/[^a-zA-Z0-9]/g, '_')}`;
      googleAvatarUrl = await this.cloudinaryService.uploadImageFromUrl(
        payload.picture,
        'rentmate/avatars',
        publicId,
      );
      if (!googleAvatarUrl) {
        googleAvatarUrl = payload.picture;
      }
    } else {
      googleAvatarUrl = AvatarHelper.generateDefaultAvatar(email);
    }

    if (existingUser) {
      // User lama (sudah terdaftar): otomatis hubungkan providerId jika belum ada
      if (!existingUser.providerId && payload.sub) {
        await this.db
          .update(schema.users)
          .set({
            providerId: payload.sub,
            isVerified: true,
            updatedAt: new Date(),
          })
          .where(eq(schema.users.id, existingUser.id));
      }

      // Sinkronisasi avatar Google ke profil jika belum ada atau masih avatar default DiceBear
      if (
        googleAvatarUrl &&
        (!existingUser.profile?.avatarUrl ||
          existingUser.profile.avatarUrl.includes('dicebear.com'))
      ) {
        await this.db
          .update(schema.userProfiles)
          .set({
            avatarUrl: googleAvatarUrl,
            updatedAt: new Date(),
          })
          .where(eq(schema.userProfiles.userId, existingUser.id));
        if (existingUser.profile) {
          existingUser.profile.avatarUrl = googleAvatarUrl;
        }
      }

      const tokens = await this.generateTokens(
        existingUser.id,
        existingUser.email,
        existingUser.role,
      );
      await this.updateRefreshToken(existingUser.id, tokens.refreshToken);
      await this.usersService.updateLastLogin(existingUser.id);

      const { passwordHash, refreshTokenHash, ...userResult } = existingUser;

      return {
        isNewUser: false,
        user: userResult,
        ...tokens,
      };
    }

    // User baru belum terdaftar di database
    // Jika peran (role) belum dipilih, beri sinyal ke frontend untuk menampilkan Role Selection Modal
    if (!dto.role) {
      return {
        isNewUser: true,
        email,
        fullName: payload.name || email.split('@')[0],
        avatarUrl: googleAvatarUrl,
        googleId: payload.sub,
      };
    }

    // User baru dengan peran yang sudah ditentukan (OWNER atau TENANT)
    const randomPassword = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(randomPassword, 10);

    const { newUser, profile } = await this.db.transaction(
      async (tx: any) => {
        const [createdUser] = await tx
          .insert(schema.users)
          .values({
            email,
            passwordHash,
            role: dto.role,
            isVerified: true,
            provider: 'google',
            providerId: payload.sub,
          })
          .returning();

        const [createdProfile] = await tx
          .insert(schema.userProfiles)
          .values({
            userId: createdUser.id,
            fullName: payload.name || email.split('@')[0],
            avatarUrl:
              googleAvatarUrl ||
              AvatarHelper.generateDefaultAvatar(createdUser.id),
          })
          .returning();

        return { newUser: createdUser, profile: createdProfile };
      },
    );

    const tokens = await this.generateTokens(
      newUser.id,
      newUser.email,
      newUser.role,
    );
    await this.updateRefreshToken(newUser.id, tokens.refreshToken);
    await this.usersService.updateLastLogin(newUser.id);

    return {
      isNewUser: false,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        isVerified: newUser.isVerified,
        createdAt: newUser.createdAt,
        profile,
      },
      ...tokens,
    };
  }


  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const defaultAvatar = AvatarHelper.generateDefaultAvatar(dto.email);

    const { newUser, profile } = await this.db.transaction(
      async (tx: any) => {
        const [createdUser] = await tx
          .insert(schema.users)
          .values({
            email: dto.email.toLowerCase().trim(),
            passwordHash,
            role: (dto.role as any) || 'USER',
            isVerified: false,
            provider: 'local',
          })
          .returning();

        const [createdProfile] = await tx
          .insert(schema.userProfiles)
          .values({
            userId: createdUser.id,
            fullName: dto.fullName,
            avatarUrl: defaultAvatar,
          })
          .returning();

        return { newUser: createdUser, profile: createdProfile };
      },
    );

    const tokens = await this.generateTokens(newUser.id, newUser.email, newUser.role);
    await this.updateRefreshToken(newUser.id, tokens.refreshToken);

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        isVerified: newUser.isVerified,
        createdAt: newUser.createdAt,
        profile,
      },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email, true);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    await this.usersService.updateLastLogin(user.id);

    const { passwordHash, refreshTokenHash, ...userResult } = user;

    return {
      user: userResult,
      ...tokens,
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync(dto.refreshToken, {
        secret: this.getJwtRefreshSecret(),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const userWithSecrets = await this.db.query.users.findFirst({
      where: eq(schema.users.id, payload.sub),
    });

    if (!userWithSecrets || !userWithSecrets.refreshTokenHash) {
      throw new UnauthorizedException('Access denied');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      dto.refreshToken,
      userWithSecrets.refreshTokenHash,
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateTokens(
      userWithSecrets.id,
      userWithSecrets.email,
      userWithSecrets.role,
    );
    await this.updateRefreshToken(userWithSecrets.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { success: true, message: 'Logged out successfully' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, userId),
    });

    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }

    if (user.passwordHash) {
      const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);
      if (!isMatch) {
        throw new UnauthorizedException('Kata sandi saat ini tidak valid');
      }
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        'Kata sandi baru tidak boleh sama dengan kata sandi saat ini',
      );
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.db
      .update(schema.users)
      .set({
        passwordHash: newPasswordHash,
        refreshTokenHash: null, // Invalidate all refresh tokens to enforce fresh authentication on other devices
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId));

    return {
      success: true,
      message: 'Kata sandi berhasil diperbarui. Sesi perangkat lain telah dinonaktifkan.',
    };
  }

  private getJwtSecret(): string {
    const secret = this.configService.get<string>('JWT_SECRET');
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';
    if ((!secret || secret === 'default_secret') && isProd) {
      throw new Error(
        'FATAL: JWT_SECRET environment variable is missing or insecure in production!',
      );
    }
    return secret || 'default_secret';
  }

  private getJwtRefreshSecret(): string {
    const secret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';
    if ((!secret || secret === 'default_refresh_secret') && isProd) {
      throw new Error(
        'FATAL: JWT_REFRESH_SECRET environment variable is missing or insecure in production!',
      );
    }
    return secret || 'default_refresh_secret';
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload: JwtPayload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.getJwtSecret(),
        expiresIn: (this.configService.get<string>('JWT_EXPIRATION') || '1h') as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.getJwtRefreshSecret(),
        expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '30d') as any,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(userId, hash);
  }
}
