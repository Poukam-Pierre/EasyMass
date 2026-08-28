import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/guard/auth.guards';
import { RolesGuard } from './auth/guard/roles.guard';
import { PaymentModule } from './payment/payment.module';
import { PrismaModule } from './prisma/prisma.module';
import { MassModule } from './mass/mass.module';
import { TransactionsModule } from './transactions/transactions.module';
import { MassOrderModule } from './mass-order/mass-order.module';
import { CityModule } from './city/city.module';
import { MassPriceModule } from './mass-price/mass-price.module';
import { PlatformSettingsModule } from './platform-settings/platform-settings.module';
import { AdminDashboardModule } from './admin-dashboard/admin-dashboard.module';
import { MassSchedulerModule } from './mass-scheduler/mass-scheduler.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    PaymentModule,
    MassModule,
    TransactionsModule,
    MassOrderModule,
    CityModule,
    MassPriceModule,
    PlatformSettingsModule,
    AdminDashboardModule,
    MassSchedulerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global auth: every route requires a valid JWT unless marked @Public().
    // RolesGuard runs after AuthGuard and additionally restricts routes
    // marked @Roles(...) to those UserRole(s).
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
