import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ParishModule } from '../../modules/parish/parish.module';
import { AdministratorModule } from '../../modules/administrator/administrator.module';
import { PriestModule } from '../../modules/priest/priest.module';
import { RefreshTokenModule } from '../../modules/refresh-token/refresh-token.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: '24h' },
    }),
    // ParishModule,
    // AdministratorModule,
    // PriestModule,
    // RefreshTokenModule,
    // PrismaModule,
  ],
})
export class AuthModule {}
