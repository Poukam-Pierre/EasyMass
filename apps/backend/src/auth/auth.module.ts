import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ParishModule } from '../parish/parish.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AdministratorModule } from '../administrator/administrator.module';
import { PriestModule } from '../priest/priest.module';

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
    PrismaModule,
    AdministratorModule,
    PriestModule,
  ],
})
export class AuthModule {}
