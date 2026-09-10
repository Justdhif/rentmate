import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ResolveWorkDto {
  @IsString()
  @IsNotEmpty({ message: 'Work summary is required' })
  workSummary: string;

  @IsOptional()
  @IsString()
  materialsUsed?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  actualCost?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];
}
