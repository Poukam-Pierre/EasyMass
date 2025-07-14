import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AdministratorService } from './administrator.service';
import { AdministratorController } from './administrator.controller';

@Module({
  imports: [PrismaModule],
  providers: [AdministratorService],
  exports: [AdministratorService],
  controllers: [AdministratorController],
})
export class AdministratorModule {}
