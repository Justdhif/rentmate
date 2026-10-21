import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('properties')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get('public/explore')
  @Public()
  async explore() {
    const propertyList = await this.propertiesService.findPublic();
    return {
      success: true,
      data: propertyList,
    };
  }

  @Get('public/:id')
  @Public()
  async findOnePublic(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    const property = await this.propertiesService.findOne(id);
    return {
      success: true,
      data: property,
    };
  }

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
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
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
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
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
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser('id') ownerId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.propertiesService.remove(id, ownerId, role);
  }
}
