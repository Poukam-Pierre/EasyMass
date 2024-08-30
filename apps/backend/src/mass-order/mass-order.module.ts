import { Module } from '@nestjs/common';
import { MassOrderService } from './mass-order.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MassOrderController } from './mass-order.controller';
import { MassModule } from '../mass/mass.module';

@Module({
  imports: [PrismaModule, MassModule],
  providers: [MassOrderService],
  controllers: [MassOrderController],
  exports: [MassOrderService],
})
export class MassOrderModule {}
