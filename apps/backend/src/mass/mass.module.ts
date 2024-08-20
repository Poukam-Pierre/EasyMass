import { Module } from '@nestjs/common';
import { MassService } from './mass.service';

@Module({
  providers: [MassService],
})
export class MassModule {}
