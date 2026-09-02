import { Currency } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdatePlatformSettingsDto {
  @IsEnum(Currency)
  currency: Currency;

  @IsNumber()
  @Min(0)
  @IsOptional()
  platformFeePercentage?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  platformFeeFixedAmount?: number;
}
