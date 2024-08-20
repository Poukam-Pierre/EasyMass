import { Module } from '@nestjs/common';
import { MassOrderService } from './mass-order.service';

@Module({
  providers: [MassOrderService],
})
export class MassOrderModule {}
