import { Module } from '@nestjs/common';
import { BelieverService } from './believer.service';

@Module({
  providers: [BelieverService],
  exports: [BelieverService],
})
export class BelieverModule {}
