import { IsNotEmpty, IsString } from 'class-validator';

export class ChatAssistantDto {
  @IsString()
  @IsNotEmpty({ message: 'Question or message is required' })
  message: string;
}
