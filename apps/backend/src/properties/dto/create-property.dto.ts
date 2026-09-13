import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { IsValidImageFile } from '../../common/decorators/is-valid-image-file.decorator';

export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty({ message: 'Property name is required' })
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  address: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  rules?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  contactInfo?: string;

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

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  facilities?: string[];
}
