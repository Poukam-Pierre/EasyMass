import { Module } from '@nestjs/common';
import { ParishModule } from '../parish/parish.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaypalService } from './paypal.service';
import { BelieverModule } from '../believer/believer.module';
import { MassModule } from '../mass/mass.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PlatformSettingsModule } from '../platform-settings/platform-settings.module';
import { MassPriceModule } from '../mass-price/mass-price.module';
import { CurrencyConversionModule } from '../currency-conversion/currency-conversion.module';
import { SmsModule } from '../sms/sms.module';
import { MailModule } from '../mail/mail.module';
import { PdfModule } from '../pdf/pdf.module';

@Module({
  imports: [
    ParishModule,
    TransactionsModule,
    BelieverModule,
    MassModule,
    PrismaModule,
    PlatformSettingsModule,
    MassPriceModule,
    CurrencyConversionModule,
    SmsModule,
    MailModule,
    PdfModule,
  ],
  providers: [PaymentService, PaypalService],
  exports: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
