import { Module } from '@nestjs/common';
import { MassOrderService } from './mass-order.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [MassOrderService],
  exports: [MassOrderService],
})
export class MassOrderModule {}
