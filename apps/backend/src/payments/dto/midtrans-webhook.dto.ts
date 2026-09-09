import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MidtransWebhookDto {
  @IsString()
  @IsNotEmpty()
  order_id: string;

  @IsString()
  @IsNotEmpty()
  status_code: string;

  @IsString()
  @IsNotEmpty()
  gross_amount: string;

  @IsString()
  @IsNotEmpty()
  signature_key: string;

  @IsString()
  @IsNotEmpty()
  transaction_status: string;

  @IsOptional()
  @IsString()
  fraud_status?: string;

  @IsOptional()
  @IsString()
  payment_type?: string;

  @IsOptional()
  @IsString()
  transaction_id?: string;

  @IsOptional()
  @IsString()
  transaction_time?: string;

  @IsOptional()
  @IsString()
  settlement_time?: string;
}
