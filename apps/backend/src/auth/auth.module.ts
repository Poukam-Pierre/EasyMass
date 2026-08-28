import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdministratorModule } from '../administrator/administrator.module';
import { PrismaModule } from '../prisma/prisma.module';
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
    PrismaModule,
    AdministratorModule,
    RefreshTokenModule,
  ],
})
export class AuthModule {}
