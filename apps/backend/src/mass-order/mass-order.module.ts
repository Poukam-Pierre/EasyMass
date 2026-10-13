import { Module } from '@nestjs/common';
import { MassOrderService } from './mass-order.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MassOrderController } from './mass-order.controller';
import { MassIntentionsController } from './mass-intentions.controller';
import { MassModule } from '../mass/mass.module';
import { PdfModule } from '../pdf/pdf.module';

@Module({
  imports: [PrismaModule, MassModule, PdfModule],
  providers: [MassOrderService],
  controllers: [MassOrderController, MassIntentionsController],
  exports: [MassOrderService],
})
export class MassOrderModule {}
