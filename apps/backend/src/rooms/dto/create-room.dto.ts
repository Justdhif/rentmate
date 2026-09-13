import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsValidImageFile } from '../../common/decorators/is-valid-image-file.decorator';

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
}

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty({ message: 'Room number is required' })
  roomNumber: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  floor?: number;

  @IsOptional()
  @IsString()
  roomType?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Price must be a positive number' })
  price: number;

  @IsOptional()
  @IsEnum(RoomStatus, {
    message: 'Status must be AVAILABLE, OCCUPIED, or MAINTENANCE',
  })
  status?: RoomStatus;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  facilities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10, { message: 'Maksimal 10 foto diperbolehkan.' })
  @IsValidImageFile({
    each: true,
    message:
      'Setiap foto harus berupa file gambar valid (JPG, JPEG, PNG, WEBP) dengan ukuran maksimal 5MB.',
  })
  photos?: string[];
}
