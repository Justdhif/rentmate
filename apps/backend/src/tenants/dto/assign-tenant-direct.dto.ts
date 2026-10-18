import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AssignTenantDirectDto {
  @IsUUID('4', { message: 'Room ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Room ID is required' })
  roomId: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid tenant email' })
  tenantEmail?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email' })
  email?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid date (YYYY-MM-DD)' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid date (YYYY-MM-DD)' })
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Monthly rent must be a positive number' })
  monthlyRent?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Rent amount must be a positive number' })
  rentAmount?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
