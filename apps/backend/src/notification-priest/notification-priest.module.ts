import { Module } from '@nestjs/common';
import { NotificationPriestService } from './notification-priest.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [NotificationPriestService],
  exports: [NotificationPriestService],
})
export class NotificationPriestModule {}
