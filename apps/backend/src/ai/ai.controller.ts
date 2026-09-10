import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { AnalyzeMaintenanceDto } from './dto/analyze-maintenance.dto';
import { ChatAssistantDto } from './dto/chat-assistant.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('maintenance/analyze')
  @HttpCode(HttpStatus.OK)
  async analyzeMaintenance(@Body() dto: AnalyzeMaintenanceDto) {
    const analysis = await this.aiService.analyzeMaintenanceReport(
      dto.description,
    );
    return {
      success: true,
      data: analysis,
    };
  }

  @Post('assistant')
  @Roles('OWNER', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  async chatAssistant(
    @CurrentUser('id') ownerId: string,
    @CurrentUser('role') role: string,
    @Body() dto: ChatAssistantDto,
  ) {
    const result = await this.aiService.chatAssistant(
      ownerId,
      role,
      dto.message,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Get('insights')
  @Roles('OWNER', 'ADMIN')
  async getInsights(
    @CurrentUser('id') ownerId: string,
    @CurrentUser('role') role: string,
  ) {
    const insights = await this.aiService.getSmartInsights(ownerId, role);
    return {
      success: true,
      data: insights,
    };
  }
}
