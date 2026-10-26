import { Module } from '@nestjs/common';
import { ParishService } from './parish.service';
import { ParishController } from './parish.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AccountSetupModule } from '../account-setup/account-setup.module';

@Module({
  imports: [PrismaModule, AccountSetupModule],
  providers: [ParishService],
  controllers: [ParishController],
  exports: [ParishService],
})
export class ParishModule {}
