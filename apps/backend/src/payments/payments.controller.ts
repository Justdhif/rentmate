import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { MidtransWebhookDto } from './dto/midtrans-webhook.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-bill')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN')
  async createBill(
    @CurrentUser('id') ownerId: string,
    @CurrentUser('role') role: string,
    @Body() dto: CreateBillDto,
  ) {
    const bill = await this.paymentsService.createBill(ownerId, role, dto);
    return {
      success: true,
      message: 'Bill created successfully',
      data: bill,
    };
  }

  @Post(':id/checkout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TENANT')
  async checkout(
    @Param('id') paymentId: string,
    @CurrentUser('id') tenantId: string,
  ) {
    const snapData = await this.paymentsService.checkout(paymentId, tenantId);
    return {
      success: true,
      message: 'Midtrans Snap transaction initialized',
      data: snapData,
    };
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() dto: MidtransWebhookDto) {
    return this.paymentsService.handleWebhook(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Query('status') status?: string,
  ) {
    const paymentList = await this.paymentsService.findAll(
      userId,
      role,
      status,
    );
    return {
      success: true,
      data: paymentList,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    const payment = await this.paymentsService.findOne(id, userId, role);
    return {
      success: true,
      data: payment,
    };
  }
}
