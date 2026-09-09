import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { MidtransService } from './midtrans.service';
import { RoomsModule } from '../rooms/rooms.module';
import { PropertiesModule } from '../properties/properties.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [RoomsModule, PropertiesModule, UsersModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, MidtransService],
  exports: [PaymentsService, MidtransService],
})
export class PaymentsModule {}
