import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PaymentModule } from './payment/payment.module';
import { PrismaModule } from './prisma/prisma.module';
import { MassModule } from './mass/mass.module';
import { TransactionsModule } from './transactions/transactions.module';
import { MassOrderModule } from './mass-order/mass-order.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PaymentModule,
    MassModule,
    TransactionsModule,
    MassOrderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
