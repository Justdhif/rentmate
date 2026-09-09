import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AssignRoomDto {
  @IsEmail({}, { message: 'Please provide a valid tenant email' })
  @IsNotEmpty({ message: 'Tenant email is required' })
  tenantEmail: string;

  @IsDateString({}, { message: 'Start date must be a valid date (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'Start date is required' })
  startDate: string;

  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid date (YYYY-MM-DD)' })
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Monthly rent must be a positive number' })
  monthlyRent?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
