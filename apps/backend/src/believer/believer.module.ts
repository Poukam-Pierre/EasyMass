import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BelieverService } from './believer.service';

@Module({
  providers: [BelieverService],
  exports: [BelieverService],
  imports: [PrismaModule],
})
export class BelieverModule {}
