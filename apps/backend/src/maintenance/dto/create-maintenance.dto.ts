import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export enum MaintenancePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class CreateMaintenanceDto {
  @IsOptional()
  @IsUUID('4', { message: 'Room ID must be a valid UUID' })
  roomId?: string;

  @IsString()
  @IsNotEmpty({ message: 'Category is required' })
  category: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  @MinLength(5, { message: 'Description must be at least 5 characters' })
  description: string;

  @IsOptional()
  @IsEnum(MaintenancePriority, {
    message: 'Priority must be LOW, MEDIUM, HIGH, or URGENT',
  })
  priority?: MaintenancePriority;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];
}
