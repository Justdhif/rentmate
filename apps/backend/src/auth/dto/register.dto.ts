import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';

export enum AllowedRegisterRole {
  OWNER = 'OWNER',
  TENANT = 'TENANT',
  TECHNICIAN = 'TECHNICIAN',
}

export class RegisterDto {
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  fullName: string;

  @IsEnum(AllowedRegisterRole, {
    message: 'Role must be OWNER, TENANT, or TECHNICIAN',
  })
  role: AllowedRegisterRole;
}
