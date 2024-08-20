import { Module } from '@nestjs/common';
import { NotificationPriestService } from './notification-priest.service';

@Module({
  providers: [NotificationPriestService],
})
export class NotificationPriestModule {}
