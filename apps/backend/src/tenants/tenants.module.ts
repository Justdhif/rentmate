import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { RoomsModule } from '../rooms/rooms.module';
import { PropertiesModule } from '../properties/properties.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [RoomsModule, PropertiesModule, UsersModule],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
