import { Module } from '@nestjs/common';
import { ParishService } from './parish.service';
import { ParishController } from './parish.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ParishService],
  controllers: [ParishController],
  exports: [ParishService],
})
export class ParishModule {}
