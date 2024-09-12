import { Module } from '@nestjs/common';
import { MassService } from './mass.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MassController } from './mass.controller';

@Module({
  imports: [PrismaModule],
  providers: [MassService],
  controllers:[MassController],
  exports: [MassService],
})
export class MassModule {}
