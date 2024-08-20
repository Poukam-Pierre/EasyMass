import { Module } from '@nestjs/common';
import { NotificationParishService } from './notification-parish.service';

@Module({
  providers: [NotificationParishService],
})
export class NotificationParishModule {}
