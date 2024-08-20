import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { BelieverModule } from '../believer/believer.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [BelieverModule, PrismaModule],
  providers: [PaymentService],
  exports: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
