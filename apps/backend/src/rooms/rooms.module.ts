import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { PropertiesModule } from '../properties/properties.module';
import { CloudinaryModule } from '../common/cloudinary/cloudinary.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [PropertiesModule, CloudinaryModule, AnalyticsModule],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService],
})
export class RoomsModule {}
