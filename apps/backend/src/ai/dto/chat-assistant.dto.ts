import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class ChatAssistantDto {
  @IsString()
  @IsNotEmpty({ message: 'Pertanyaan atau pesan tidak boleh kosong' })
  @MaxLength(2000, {
    message: 'Panjang pesan maksimal 2.000 karakter demi efisiensi kuota AI',
  })
  message: string;

  @IsOptional()
  @IsUUID('4', { message: 'ID percakapan harus berupa format UUID v4 yang valid' })
  conversationId?: string;

  @IsOptional()
  audio?: {
    url?: string;
    duration?: number;
    waveform?: number[];
  };
}
