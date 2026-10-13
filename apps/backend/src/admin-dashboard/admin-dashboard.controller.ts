import { Controller, Get } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorator/roles.decorator';
import { AdminDashboardService } from './admin-dashboard.service';

@Controller('admin/dashboard')
@Roles(UserRole.ADMIN)
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get('/money-overview')
  moneyOverview() {
    return this.adminDashboardService.moneyOverview();
  }

  @Get('/parish-overview')
  parishOverview() {
    return this.adminDashboardService.parishOverview();
  }
}
