import { Body, Controller, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthService } from './auth.service';
import { Roles } from './decorator/roles.decorator';
import { LoginDataDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { SignUpAdminDto } from './dto/signup.dto';
import { Public } from './decorator/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('/login-parish')
  loginParish(@Body() input: LoginDataDto) {
    return this.authService.login(input, [UserRole.PARISH]);
  }

  @Public()
  @Post('/login-admin')
  loginAdmin(@Body() input: LoginDataDto) {
    return this.authService.login(input, [UserRole.ADMIN]);
  }

  @Post('/signup-admin')
  @Roles(UserRole.ADMIN)
  signupAdmin(@Body() input: SignUpAdminDto) {
    return this.authService.signupAdmin(input);
  }

  @Public()
  @Post('/refreshToken')
  refreshToken(@Body() input: RefreshTokenDto) {
    return this.authService.refreshToken(input.refreshToken);
  }

  @Public()
  @Post('/logout')
  logout(@Body() input: { refreshToken: string }) {
    return this.authService.logout(input.refreshToken);
  }
}
