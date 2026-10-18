import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ResolveWorkDto {
  @IsString()
  @IsNotEmpty({ message: 'Ringkasan pekerjaan (workSummary) wajib diisi' })
  workSummary: string;

  @IsOptional()
  @IsString()
  materialsUsed?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Biaya aktual tidak boleh bernilai negatif' })
  actualCost?: number;

  @IsOptional()
  @IsArray()
  @IsUrl(
    { require_tld: false },
    { each: true, message: 'Setiap foto bukti pengerjaan harus berupa format URL valid' },
  )
  photos?: string[];
}
