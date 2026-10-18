import {
  IsOptional,
  IsString,
  MaxLength,
  IsDateString,
  Matches,
  IsIn,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  username?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Matches(/^(\+62|62|0)[0-9]{8,15}$/, {
    message:
      'Format nomor telepon tidak valid. Gunakan format standar (contoh: 08123456789 atau +628123456789)',
  })
  phoneNumber?: string;

  @IsOptional()
  @IsDateString(
    {},
    {
      message:
        'Format tanggal lahir harus berupa format tanggal ISO yang valid (YYYY-MM-DD)',
    },
  )
  birthDate?: string;

  @IsOptional()
  @IsString()
  @IsIn(['MALE', 'FEMALE', 'OTHER'], {
    message: 'Gender harus bernilai MALE, FEMALE, atau OTHER',
  })
  gender?: string;
}
