import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PriestController } from './priest.controller';
import { PriestService } from './priest.service';

@Module({
  imports: [PrismaModule],
  providers: [PriestService],
  controllers: [PriestController],
  exports: [PriestService],
})
export class PriestModule {}
