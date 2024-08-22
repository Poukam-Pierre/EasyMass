import { Module } from '@nestjs/common';
import { AdministratorService } from './administrator.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AdministratorService],
  exports: [AdministratorService],
})
export class AdministratorModule {}
