import { Module } from '@nestjs/common';
import { ParishModule } from '../parish/parish.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { BelieverModule } from '../believer/believer.module';

@Module({
  imports: [ParishModule, TransactionsModule, BelieverModule],
  providers: [PaymentService],
  exports: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
