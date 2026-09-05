import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MassPriceBandController } from './mass-price-band.controller';
import { MassPriceBandService } from './mass-price-band.service';

@Module({
  imports: [PrismaModule],
  providers: [MassPriceBandService],
  controllers: [MassPriceBandController],
  exports: [MassPriceBandService],
})
export class MassPriceBandModule {}
