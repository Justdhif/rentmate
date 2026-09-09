import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('properties')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @Roles('OWNER', 'ADMIN')
  async create(
    @CurrentUser('id') ownerId: string,
    @Body() dto: CreatePropertyDto,
  ) {
    const property = await this.propertiesService.create(ownerId, dto);
    return {
      success: true,
      message: 'Property created successfully',
      data: property,
    };
  }

  @Get()
  @Roles('OWNER', 'ADMIN')
  async findAll(
    @CurrentUser('id') ownerId: string,
    @CurrentUser('role') role: string,
  ) {
    const propertyList = await this.propertiesService.findAll(ownerId, role);
    return {
      success: true,
      data: propertyList,
    };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    const property = await this.propertiesService.findOne(id, userId, role);
    return {
      success: true,
      data: property,
    };
  }

  @Patch(':id')
  @Roles('OWNER', 'ADMIN')
  async update(
    @Param('id') id: string,
    @CurrentUser('id') ownerId: string,
    @CurrentUser('role') role: string,
    @Body() dto: UpdatePropertyDto,
  ) {
    const updated = await this.propertiesService.update(id, ownerId, role, dto);
    return {
      success: true,
      message: 'Property updated successfully',
      data: updated,
    };
  }

  @Delete(':id')
  @Roles('OWNER', 'ADMIN')
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') ownerId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.propertiesService.remove(id, ownerId, role);
  }
}
