import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBillDto {
  @IsUUID('4', { message: 'Room ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Room ID is required' })
  roomId: string;

  @IsOptional()
  @IsUUID('4', { message: 'Tenant ID must be a valid UUID' })
  tenantId?: string;

  @IsDateString({}, { message: 'Due date must be a valid date (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'Due date is required' })
  dueDate: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1000, { message: 'Amount must be at least 1,000' })
  amount?: number;

  @IsOptional()
  @IsString()
  period?: string;
}
