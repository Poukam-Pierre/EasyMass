import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
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
    // Only wired up for downloadInvoice (see PaymentController) — that route
    // is public and keyed on an unguessable reference/order-id string, so a
    // rate limit is what keeps "unguessable" from becoming "brute-forceable
    // by a script with no lockout." Not applied anywhere else in this
    // module; every other route is either authenticated or has its own
    // integrity check (e.g. re-fetching status from the gateway).
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 5 }]),
  ],
  providers: [PaymentService, PaypalService],
  exports: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
