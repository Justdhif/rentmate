import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomQueryDto } from './dto/room-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post('properties/:propertyId/rooms')
  @Roles('OWNER', 'ADMIN')
  async create(
    @Param('propertyId') propertyId: string,
    @CurrentUser('id') ownerId: string,
    @CurrentUser('role') role: string,
    @Body() dto: CreateRoomDto,
  ) {
    const room = await this.roomsService.create(propertyId, ownerId, role, dto);
    return {
      success: true,
      message: 'Room created successfully',
      data: room,
    };
  }

  @Get('properties/:propertyId/rooms')
  async findAllByProperty(
    @Param('propertyId') propertyId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Query() query: RoomQueryDto,
  ) {
    const roomList = await this.roomsService.findAllByProperty(
      propertyId,
      userId,
      role,
      query,
    );
    return {
      success: true,
      data: roomList,
    };
  }

  @Get('rooms/:id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    const room = await this.roomsService.findOne(id, userId, role);
    return {
      success: true,
      data: room,
    };
  }

  @Patch('rooms/:id')
  @Roles('OWNER', 'ADMIN')
  async update(
    @Param('id') id: string,
    @CurrentUser('id') ownerId: string,
    @CurrentUser('role') role: string,
    @Body() dto: UpdateRoomDto,
  ) {
    const updated = await this.roomsService.update(id, ownerId, role, dto);
    return {
      success: true,
      message: 'Room updated successfully',
      data: updated,
    };
  }

  @Delete('rooms/:id')
  @Roles('OWNER', 'ADMIN')
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') ownerId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.roomsService.remove(id, ownerId, role);
  }
}
