import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';

@Module({
  imports: [PrismaModule],
  providers: [AdminDashboardService],
  controllers: [AdminDashboardController],
})
export class AdminDashboardModule {}
