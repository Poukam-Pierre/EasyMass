import { Module } from '@nestjs/common';
import { ParishService } from './parish.service';

@Module({
  providers: [ParishService],
})
export class ParishModule {}
