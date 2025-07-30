import { Module } from '@nestjs/common';
import { AuthModule } from '../../app/auth/auth.module';
import { ParishController } from './parish.controller';
import { ParishService } from './parish.service';
import { TwoFaModule } from '../../app/two-fa/two-fa.module';

@Module({
  imports: [AuthModule, TwoFaModule],
  providers: [ParishService],
  controllers: [ParishController],
  exports: [ParishService],
})
export class ParishModule {}
