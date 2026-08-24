import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Role, ROLE } from './decorator/public.decorator';
import { LoginDataDto } from './dto/login.dto';
import { RefreshToken } from './dto/refreshToken.dto';
import { SignUpAdminDto, SignUpDataDto } from './dto/signup.dto';
import { AdminGuard } from './guard/admin.guards';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login-parish')
  loginParish(@Body() input: LoginDataDto) {
    return this.authService.authenticate(input, 'parish');
  }

  @Post('/login-admin')
  loginAdmin(@Body() input: LoginDataDto) {
    return this.authService.authenticate(input, 'admin');
  }

  @Post('/login-priest')
  loginPriest(@Body() input: LoginDataDto) {
    return this.authService.authenticate(input, 'priest');
  }

  @Post('/signup')
  signUpPriest(@Body() input: SignUpDataDto) {
    return this.authService.signupPriest(input);
  }

  @Post('/signup-admin')
  @Role(ROLE.ADMIN)
  @UseGuards(AdminGuard)
  signupAdmin(
    @Body()
    input: SignUpAdminDto
  ) {
    return this.authService.signupAdmin(input);
  }

  // @Post('/signup-parish')
  // @UseGuards(AdminGuard)
  // @Role(ROLE.ADMIN)
  // @Role(ROLE.ENGINEER)
  // signupParish(@Body() input: SignUpParishDto, @Request() request) {
  //   return this.authService.signupParish(input, request);
  // }

  @Post('/refreshToken')
  refreshToken(@Body() refreshToken: RefreshToken) {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('/logout')
  logout(@Body() input: { refreshToken: string }) {
    return this.authService.logout(input.refreshToken);
  }
}
