import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum AllowedGoogleRole {
  USER = 'USER',
  OWNER = 'OWNER',
  TENANT = 'TENANT',
}

export class GoogleAuthDto {
  @IsString()
  @IsNotEmpty({ message: 'Google ID Token wajib disertakan' })
  idToken: string;

  @IsEnum(AllowedGoogleRole, {
    message: 'Peran harus USER, OWNER, atau TENANT',
  })
  @IsOptional()
  role?: AllowedGoogleRole;
}
