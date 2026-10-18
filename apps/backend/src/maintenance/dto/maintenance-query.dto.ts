import { IsOptional, IsString } from 'class-validator';
import { PageOptionsDto } from '../../common/dto/pagination.dto';

export class MaintenanceQueryDto extends PageOptionsDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsString()
  roomId?: string;

  @IsOptional()
  @IsString()
  category?: string;
}
