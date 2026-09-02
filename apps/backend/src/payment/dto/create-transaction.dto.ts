import { Currency, PaymentMethod } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BelieverInfoDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  /** Not required at the DTO level — the frontend only asks for it on the
   * PayPal tab (where it's the invoice-delivery channel; mobile-money
   * checkouts get their invoice by SMS to `phone` instead). Left optional
   * here rather than cross-validated against paymentInfo.paymentMethod so
   * a missing email never blocks a checkout — PaymentService just skips
   * sending the invoice email if it's absent. */
  @IsOptional()
  @IsEmail()
  email?: string;
}

/** No `price` here — trusting a client-supplied amount for what a mass
 * costs would let a checkout be submitted for less than the parish's
 * actual listed price. PaymentService resolves the real price server-side
 * from Mass.price/MassPrice, keyed by `id` + the checkout's currency. */
export class MassInfoDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  intension: string;
}

/** No `amount` here, for the same reason MassInfoDto has no `price` — the
 * total actually charged is the server-computed sum of each mass's
 * resolved price plus the platform fee, never a client-supplied number. */
export class PaymentInfoDto {
  @IsEnum(Currency)
  currency: Currency;

  /** Which gateway processes this checkout — MOBILE_MONEY (NotchPay) or
   * PAYPAL. BANK_TRANSFER exists in the schema's PaymentMethod enum but has
   * no gateway wired up yet. */
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  /** Only meaningful for MOBILE_MONEY — the number NotchPay charges. */
  @ValidateIf((o) => o.paymentMethod === PaymentMethod.MOBILE_MONEY)
  @IsString()
  @IsNotEmpty()
  phone?: string;
}

export class CreateTransactionDto {
  @ValidateNested()
  @Type(() => BelieverInfoDto)
  believerInfo: BelieverInfoDto;

  @ValidateNested({ each: true })
  @Type(() => MassInfoDto)
  massInfos: MassInfoDto[];

  @ValidateNested()
  @Type(() => PaymentInfoDto)
  paymentInfo: PaymentInfoDto;
}
