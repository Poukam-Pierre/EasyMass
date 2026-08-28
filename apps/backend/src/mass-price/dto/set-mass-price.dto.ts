import { Currency } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class SetMassPriceDto {
  @IsEnum(Currency)
  currency: Currency;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amount: number;
}
