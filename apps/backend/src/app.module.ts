import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PropertiesModule } from './properties/properties.module';
import { RoomsModule } from './rooms/rooms.module';
import { TenantsModule } from './tenants/tenants.module';
import { PaymentsModule } from './payments/payments.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AiModule } from './ai/ai.module';
import { MailModule } from './mail/mail.module';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module';
import { FavoritesModule } from './favorites/favorites.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 15, // 15 requests per second
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 80, // 80 requests per 10 seconds
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 300, // 300 requests per minute
      },
    ]),
    CloudinaryModule,
    DatabaseModule,
    UsersModule,
    AuthModule,
    PropertiesModule,
    RoomsModule,
    TenantsModule,
    PaymentsModule,
    MaintenanceModule,
    AnalyticsModule,
    AiModule,
    MailModule,
    FavoritesModule,
    ReviewsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
