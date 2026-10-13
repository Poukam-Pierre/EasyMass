import { Currency } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class RemovePlatformSettingsDto {
  @IsEnum(Currency)
  currency: Currency;
}
