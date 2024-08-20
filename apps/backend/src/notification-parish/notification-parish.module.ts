import { Module } from '@nestjs/common';
import { NotificationParishService } from './notification-parish.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [NotificationParishService],
  exports: [NotificationParishService],
})
export class NotificationParishModule {}
