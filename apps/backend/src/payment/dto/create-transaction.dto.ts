import { Currency } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BelieverInfoDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class MassInfoDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsNotEmpty()
  intension: string;
}

export class PaymentInfoDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsString()
  phone: string;
}

/** Field names here (believerInfo/massInfos/paymentInfo) must match exactly
 * what PaymentService.notifyPayment parses back out of the NotchPay webhook
 * metadata — they previously didn't (massInfo vs massInfos), so no real
 * webhook call could ever succeed. */
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
