import { Module } from '@nestjs/common';
import { MassService } from './mass.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [MassService],
  exports: [MassService],
})
export class MassModule {}
