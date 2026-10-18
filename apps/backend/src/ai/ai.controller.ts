import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AiService } from './ai.service';
import { AnalyzeMaintenanceDto } from './dto/analyze-maintenance.dto';
import { ChatAssistantDto } from './dto/chat-assistant.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  // ==========================================
  // CONVERSATIONS ENDPOINTS
  // ==========================================

  @Get('conversations')
  @Roles('OWNER', 'ADMIN', 'TENANT')
  async getConversations(@CurrentUser('id') userId: string) {
    const list = await this.aiService.getConversations(userId);
    return {
      success: true,
      data: list,
    };
  }

  @Post('conversations')
  @Roles('OWNER', 'ADMIN', 'TENANT')
  async createConversation(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateConversationDto,
  ) {
    const created = await this.aiService.createConversation(userId, dto);
    return {
      success: true,
      data: created,
    };
  }

  @Get('conversations/:id')
  @Roles('OWNER', 'ADMIN', 'TENANT')
  async getConversation(
    @CurrentUser('id') userId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    const conv = await this.aiService.getConversationById(id, userId);
    return {
      success: true,
      data: conv,
    };
  }

  @Patch('conversations/:id')
  @Roles('OWNER', 'ADMIN', 'TENANT')
  async updateConversation(
    @CurrentUser('id') userId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateConversationDto,
  ) {
    const updated = await this.aiService.updateConversation(id, userId, dto);
    return {
      success: true,
      data: updated,
    };
  }

  @Delete('conversations/:id')
  @Roles('OWNER', 'ADMIN', 'TENANT')
  async deleteConversation(
    @CurrentUser('id') userId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    const result = await this.aiService.deleteConversation(id, userId);
    return {
      success: true,
      data: result,
    };
  }

  @Delete('conversations')
  @Roles('OWNER', 'ADMIN', 'TENANT')
  async clearAllConversations(@CurrentUser('id') userId: string) {
    const result = await this.aiService.clearAllConversations(userId);
    return {
      success: true,
      data: result,
    };
  }

  // ==========================================
  // CHAT & MAINTENANCE ENDPOINTS
  // ==========================================

  @Throttle({ default: { limit: 15, ttl: 60000 } })
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

  @Throttle({ default: { limit: 15, ttl: 60000 } })
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
      dto.conversationId,
      dto.audio,
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
