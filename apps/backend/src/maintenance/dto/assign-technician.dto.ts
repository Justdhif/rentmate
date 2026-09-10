import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AssignTechnicianDto {
  @IsUUID('4', { message: 'Technician ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Technician ID is required' })
  technicianId: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  estimatedCost?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
