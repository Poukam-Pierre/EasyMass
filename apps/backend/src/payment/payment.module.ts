import { Module } from '@nestjs/common';
import { ParishModule } from '../parish/parish.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { BelieverModule } from '../believer/believer.module';
import { MassModule } from '../mass/mass.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    ParishModule,
    TransactionsModule,
    BelieverModule,
    MassModule,
    PrismaModule,
  ],
  providers: [PaymentService],
  exports: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
