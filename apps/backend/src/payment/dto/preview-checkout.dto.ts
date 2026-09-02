import { Currency } from '@prisma/client';
import { ArrayNotEmpty, IsEnum, IsString } from 'class-validator';

/** No believer/payment-method fields — this is a read-only price lookup,
 * not a checkout. Mirrors the mass-id/currency inputs CreateTransactionDto
 * uses for pricing, without the fields only relevant once a payment is
 * actually being submitted. */
export class PreviewCheckoutDto {
  @IsString({ each: true })
  @ArrayNotEmpty()
  massIds: string[];

  @IsEnum(Currency)
  currency: Currency;
}
