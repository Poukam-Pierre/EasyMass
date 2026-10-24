import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AccountSetupController } from './account-setup.controller';
import { AccountSetupService } from './account-setup.service';

@Module({
  imports: [PrismaModule, MailModule],
  providers: [AccountSetupService],
  controllers: [AccountSetupController],
  exports: [AccountSetupService],
})
export class AccountSetupModule {}
