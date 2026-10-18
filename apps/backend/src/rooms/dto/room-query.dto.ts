import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RoomStatus } from './create-room.dto';
import { PageOptionsDto } from '../../common/dto/pagination.dto';

export class RoomQueryDto extends PageOptionsDto {
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
