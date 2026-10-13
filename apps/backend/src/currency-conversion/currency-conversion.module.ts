import { Module } from '@nestjs/common';
import { CurrencyConversionService } from './currency-conversion.service';

@Module({
  providers: [CurrencyConversionService],
  exports: [CurrencyConversionService],
})
export class CurrencyConversionModule {}
