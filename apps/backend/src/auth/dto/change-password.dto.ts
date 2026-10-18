import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Kata sandi saat ini wajib diisi' })
  currentPassword: string;

  @IsString()
  @IsNotEmpty({ message: 'Kata sandi baru wajib diisi' })
  @MinLength(8, { message: 'Kata sandi baru minimal 8 karakter' })
  @Matches(
    /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
    {
      message:
        'Kata sandi baru harus mengandung kombinasi huruf besar, huruf kecil, dan angka atau karakter khusus',
    },
  )
  newPassword: string;
}
