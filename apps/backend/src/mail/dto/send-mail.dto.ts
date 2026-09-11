import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendMailDto {
  @IsEmail({}, { message: 'Alamat email tujuan tidak valid' })
  @IsNotEmpty({ message: 'Email tujuan (to) wajib diisi' })
  to: string;

  @IsString()
  @IsNotEmpty({ message: 'Subjek email wajib diisi' })
  subject: string;

  @IsString()
  @IsOptional()
  text?: string;

  @IsString()
  @IsOptional()
  html?: string;

  @IsString()
  @IsOptional()
  heading?: string;

  @IsString()
  @IsOptional()
  badge?: string;

  @IsString()
  @IsOptional()
  ctaText?: string;

  @IsString()
  @IsOptional()
  ctaUrl?: string;
}

export class TestMailDto {
  @IsEmail({}, { message: 'Alamat email tujuan tidak valid' })
  @IsNotEmpty({ message: 'Email tujuan wajib diisi' })
  to: string;
}
