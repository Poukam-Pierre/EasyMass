import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MassPriceController } from './mass-price.controller';
import { MassPriceService } from './mass-price.service';

@Module({
  imports: [PrismaModule],
  providers: [MassPriceService],
  controllers: [MassPriceController],
  exports: [MassPriceService],
})
export class MassPriceModule {}
