import { Module } from '@nestjs/common';
import { PriestService } from './priest.service';

@Module({
  providers: [PriestService],
})
export class PriestModule {}
