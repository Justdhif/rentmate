import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { MidtransService } from './midtrans.service';
import { RoomsModule } from '../rooms/rooms.module';
import { PropertiesModule } from '../properties/properties.module';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    RoomsModule,
    PropertiesModule,
    UsersModule,
    MailModule,
    AnalyticsModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, MidtransService],
  exports: [PaymentsService, MidtransService],
})
export class PaymentsModule {}
