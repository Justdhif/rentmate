import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @Roles('OWNER', 'ADMIN')
  async getOverview(
    @CurrentUser('id') ownerId: string,
    @CurrentUser('role') role: string,
  ) {
    const data = await this.analyticsService.getOverview(ownerId, role);
    return {
      success: true,
      data,
    };
  }

  @Get('revenue')
  @Roles('OWNER', 'ADMIN')
  async getRevenue(
    @CurrentUser('id') ownerId: string,
    @CurrentUser('role') role: string,
  ) {
    const data = await this.analyticsService.getRevenueMetrics(ownerId, role);
    return {
      success: true,
      data,
    };
  }

  @Get('occupancy')
  @Roles('OWNER', 'ADMIN')
  async getOccupancy(
    @CurrentUser('id') ownerId: string,
    @CurrentUser('role') role: string,
  ) {
    const data = await this.analyticsService.getOccupancyMetrics(ownerId, role);
    return {
      success: true,
      data,
    };
  }

  @Get('maintenance')
  @Roles('OWNER', 'ADMIN')
  async getMaintenance(
    @CurrentUser('id') ownerId: string,
    @CurrentUser('role') role: string,
  ) {
    const data = await this.analyticsService.getMaintenanceMetrics(
      ownerId,
      role,
    );
    return {
      success: true,
      data,
    };
  }
}
