import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt/jwt.strategy';
import { LocalStrategy } from './local/local.strategy';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { TwoFaModule } from '../two-fa/two-fa.module';

@Module({
  providers: [AuthService, JwtStrategy, LocalStrategy],
  controllers: [AuthController],
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return { secret: configService.get('JWT_SECRET') };
      },
    }),
    PassportModule,
    TwoFaModule,
    // ParishModule,
    // AdministratorModule,
    // PriestModule,
    // RefreshTokenModule,
    // PrismaModule,
  ],
})
export class AuthModule {}
