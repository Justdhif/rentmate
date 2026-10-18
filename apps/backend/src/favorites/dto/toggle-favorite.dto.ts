import { IsOptional, IsUUID } from 'class-validator';

export class ToggleFavoriteDto {
  @IsOptional()
  @IsUUID('4')
  propertyId?: string;

  @IsOptional()
  @IsUUID('4')
  roomId?: string;
}
