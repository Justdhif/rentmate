import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RoomStatus } from './create-room.dto';

export class RoomQueryDto {
  @IsOptional()
  @IsEnum(RoomStatus)
  status?: RoomStatus;

  @IsOptional()
  @IsString()
  roomType?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
