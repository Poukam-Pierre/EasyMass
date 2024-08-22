import { Module } from '@nestjs/common';
import { PriestService } from './priest.service';
import { PriestController } from './priest.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [PrismaService],
  providers: [PriestService],
  controllers: [PriestController],
  exports: [PriestService],
})
export class PriestModule {}
