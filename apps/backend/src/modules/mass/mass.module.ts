import { Module } from '@nestjs/common';
import { MassService } from './mass.service';
import { MassController } from './mass.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [MassService],
  controllers: [MassController],
  exports: [MassService],
})
export class MassModule {}
