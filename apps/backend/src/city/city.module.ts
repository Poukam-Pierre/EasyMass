import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CityController } from './city.controller';
import { CityService } from './city.service';

@Module({
  imports: [PrismaModule],
  providers: [CityService],
  controllers: [CityController],
  exports: [CityService],
})
export class CityModule {}
