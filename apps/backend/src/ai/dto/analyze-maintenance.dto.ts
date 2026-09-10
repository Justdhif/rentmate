import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AnalyzeMaintenanceDto {
  @IsString()
  @IsNotEmpty({ message: 'Maintenance report description is required' })
  @MinLength(5, { message: 'Description must be at least 5 characters' })
  description: string;
}
