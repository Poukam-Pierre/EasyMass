import { Module } from '@nestjs/common';
import { AuthModule } from '../../app/auth/auth.module';
import { TwoFaModule } from '../../app/two-fa/two-fa.module';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [TwoFaModule, AuthModule],
  providers: [AdminService],
  exports: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
