import { Module } from '@nestjs/common';
import { AdministratorService } from './administrator.service';
import { AdministratorController } from './administrator.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AdministratorService],
  controllers: [AdministratorController],
  exports: [AdministratorService],
})
export class AdministratorModule {}
