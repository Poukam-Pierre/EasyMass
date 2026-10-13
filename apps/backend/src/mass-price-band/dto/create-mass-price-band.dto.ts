import { Currency } from '@prisma/client';
import { IsEnum, IsNumber, Min } from 'class-validator';

export class CreateMassPriceBandDto {
  @IsEnum(Currency)
  currency: Currency;

  /** Inclusive lower bound, in XAF (Mass.price) — a mass with this exact
   * price matches this band. */
  @IsNumber()
  @Min(0)
  minPrice: number;

  /** Exclusive upper bound, in XAF — a mass priced exactly at this value
   * belongs to the next band up, not this one. */
  @IsNumber()
  @Min(0)
  maxPrice: number;

  /** The price, in `currency`, for any mass whose XAF price falls in
   * [minPrice, maxPrice). */
  @IsNumber()
  @Min(0)
  amount: number;
}
