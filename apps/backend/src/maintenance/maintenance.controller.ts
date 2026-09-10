import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { AssignTechnicianDto } from './dto/assign-technician.dto';
import { ResolveWorkDto } from './dto/resolve-work.dto';
import { MaintenanceQueryDto } from './dto/maintenance-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('maintenance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post()
  @Roles('TENANT')
  async createReport(
    @CurrentUser('id') tenantId: string,
    @Body() dto: CreateMaintenanceDto,
  ) {
    const report = await this.maintenanceService.createReport(tenantId, dto);
    return {
      success: true,
      message: 'Maintenance report submitted successfully',
      data: report,
    };
  }

  @Get()
  async findAll(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Query() query: MaintenanceQueryDto,
  ) {
    const list = await this.maintenanceService.findAll(userId, role, query);
    return {
      success: true,
      data: list,
    };
  }

  @Get('room/:roomId/history')
  async findRoomHistory(
    @Param('roomId') roomId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    const history = await this.maintenanceService.findRoomHistory(
      roomId,
      userId,
      role,
    );
    return {
      success: true,
      data: history,
    };
  }

  @Get(':id')
  async findOne(
    @Param('id') ticketId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    const ticket = await this.maintenanceService.findOne(
      ticketId,
      userId,
      role,
    );
    return {
      success: true,
      data: ticket,
    };
  }

  @Post(':id/assign')
  @Roles('OWNER', 'ADMIN')
  async assignTechnician(
    @Param('id') ticketId: string,
    @CurrentUser('id') ownerId: string,
    @CurrentUser('role') role: string,
    @Body() dto: AssignTechnicianDto,
  ) {
    const ticket = await this.maintenanceService.assignTechnician(
      ticketId,
      ownerId,
      role,
      dto,
    );
    return {
      success: true,
      message: 'Technician assigned successfully',
      data: ticket,
    };
  }

  @Post(':id/start')
  @Roles('TECHNICIAN', 'ADMIN')
  async startWork(
    @Param('id') ticketId: string,
    @CurrentUser('id') technicianId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.maintenanceService.startWork(ticketId, technicianId, role);
  }

  @Post(':id/resolve')
  @Roles('TECHNICIAN', 'ADMIN')
  async resolveWork(
    @Param('id') ticketId: string,
    @CurrentUser('id') technicianId: string,
    @CurrentUser('role') role: string,
    @Body() dto: ResolveWorkDto,
  ) {
    const ticket = await this.maintenanceService.resolveWork(
      ticketId,
      technicianId,
      role,
      dto,
    );
    return {
      success: true,
      message: 'Maintenance work completed and marked as RESOLVED',
      data: ticket,
    };
  }

  @Post(':id/close')
  @Roles('OWNER', 'ADMIN')
  async closeTicket(
    @Param('id') ticketId: string,
    @CurrentUser('id') ownerId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.maintenanceService.closeTicket(ticketId, ownerId, role);
  }
}
