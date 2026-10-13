import { Module } from '@nestjs/common';
import { MassModule } from '../mass/mass.module';
import { PdfModule } from '../pdf/pdf.module';
import { MailModule } from '../mail/mail.module';
import { MassSchedulerService } from './mass-scheduler.service';

@Module({
  imports: [MassModule, PdfModule, MailModule],
  providers: [MassSchedulerService],
})
export class MassSchedulerModule {}
