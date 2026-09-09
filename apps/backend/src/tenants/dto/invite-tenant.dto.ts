import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class InviteTenantDto {
  @IsEmail({}, { message: 'Please provide a valid tenant email' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  fullName: string;

  @IsOptional()
  @IsUUID('4', { message: 'Room ID must be a valid UUID' })
  roomId?: string;
}
