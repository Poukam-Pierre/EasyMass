import { Module } from '@nestjs/common';
import { PaymentModule } from '../payment/payment.module';
import { PaymentSchedulerService } from './payment-scheduler.service';

@Module({
  imports: [PaymentModule],
  providers: [PaymentSchedulerService],
})
export class PaymentSchedulerModule {}
