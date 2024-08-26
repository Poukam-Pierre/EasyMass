import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdministratorModule } from '../administrator/administrator.module';
import { ParishModule } from '../parish/parish.module';
import { PriestModule } from '../priest/priest.module';
import { RefreshTokenModule } from '../refresh-token/refresh-token.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: 900 },
    }),
    ParishModule,
    AdministratorModule,
    PriestModule,
    RefreshTokenModule,
  ],
})
export class AuthModule {}
