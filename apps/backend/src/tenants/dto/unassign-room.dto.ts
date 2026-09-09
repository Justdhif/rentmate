import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UnassignRoomDto {
  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid date (YYYY-MM-DD)' })
  endDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
