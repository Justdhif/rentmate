import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { AssignRoomDto } from './dto/assign-room.dto';
import { UnassignRoomDto } from './dto/unassign-room.dto';
import { InviteTenantDto } from './dto/invite-tenant.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post('rooms/:id/assign')
  @Roles('OWNER', 'ADMIN')
  async assignRoom(
    @Param('id') roomId: string,
    @CurrentUser('id') ownerId: string,
    @CurrentUser('role') role: string,
    @Body() dto: AssignRoomDto,
  ) {
    const result = await this.tenantsService.assignRoom(
      roomId,
      ownerId,
      role,
      dto,
    );
    return {
      success: true,
      message: 'Tenant assigned to room successfully',
      data: result,
    };
  }

  @Post('tenants/assign')
  @Roles('OWNER', 'ADMIN')
  async assignTenantDirect(
    @CurrentUser('id') ownerId: string,
    @CurrentUser('role') role: string,
    @Body() dto: any,
  ) {
    const roomId = dto.roomId;
    const result = await this.tenantsService.assignRoom(
      roomId,
      ownerId,
      role,
      {
        tenantEmail: dto.email || dto.tenantEmail,
        startDate: dto.startDate || new Date().toISOString().split('T')[0],
        endDate: dto.endDate,
        monthlyRent: dto.rentAmount ? Number(dto.rentAmount) : undefined,
      },
    );
    return {
      success: true,
      message: 'Tenant assigned to room successfully',
      data: result,
    };
  }

  @Post('rooms/:id/unassign')
  @Roles('OWNER', 'ADMIN')
  async unassignRoom(
    @Param('id') roomId: string,
    @CurrentUser('id') ownerId: string,
    @CurrentUser('role') role: string,
    @Body() dto: UnassignRoomDto,
  ) {
    return this.tenantsService.unassignRoom(roomId, ownerId, role, dto);
  }

  @Post('tenants/:id/unassign')
  @Roles('OWNER', 'ADMIN')
  async unassignTenant(
    @Param('id') id: string,
    @CurrentUser('id') ownerId: string,
    @CurrentUser('role') role: string,
    @Body() dto: UnassignRoomDto,
  ) {
    return this.tenantsService.unassignByAnyId(id, ownerId, role, dto);
  }

  @Post('tenants/invite')
  @Roles('OWNER', 'ADMIN')
  async inviteTenant(
    @CurrentUser('id') ownerId: string,
    @CurrentUser('role') role: string,
    @Body() dto: InviteTenantDto,
  ) {
    return this.tenantsService.inviteTenant(ownerId, role, dto);
  }

  @Get('tenants')
  @Roles('OWNER', 'ADMIN')
  async findAllTenants(
    @CurrentUser('id') ownerId: string,
    @CurrentUser('role') role: string,
  ) {
    const tenants = await this.tenantsService.findAllByOwner(ownerId, role);
    return {
      success: true,
      data: tenants,
    };
  }

  @Get('tenants/my-room')
  @Roles('TENANT')
  async getMyRoom(@CurrentUser('id') tenantId: string) {
    const myRoom = await this.tenantsService.getMyRoom(tenantId);
    return {
      success: true,
      data: myRoom,
    };
  }

  @Get('tenants/:id')
  @Roles('OWNER', 'ADMIN')
  async findTenantById(
    @Param('id') tenantId: string,
    @CurrentUser('id') ownerId: string,
    @CurrentUser('role') role: string,
  ) {
    const tenant = await this.tenantsService.findTenantById(
      tenantId,
      ownerId,
      role,
    );
    return {
      success: true,
      data: tenant,
    };
  }
}
