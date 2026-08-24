import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PdfModule } from '../pdf/pdf.module';
import { MailModule } from '../mail/mail.module';
import { MassSchedulerService } from './mass-scheduler.service';

@Module({
  imports: [PrismaModule, PdfModule, MailModule],
  providers: [MassSchedulerService],
})
export class MassSchedulerModule {}
