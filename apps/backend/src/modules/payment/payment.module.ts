import { Module } from '@nestjs/common';
import { ParishModule } from '../parish/parish.module';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [ParishModule, TransactionsModule, PrismaModule],
  providers: [PaymentService],
  exports: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
