import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Role, ROLE } from './decorator/public.decorator';
import { LoginDataDto } from './dto/login.dto';
import { RefreshToken } from './dto/refreshToken.dto';
import { SignUpDataDto, SignUpParish } from './dto/signup.dto';
import { AdminGuard } from './guard/admin.guards';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login-parish')
  loginParish(@Body(ValidationPipe) input: LoginDataDto) {
    return this.authService.authenticate(input, 'parish');
  }

  @Post('/login-admin')
  loginAdmin(@Body(ValidationPipe) input: LoginDataDto) {
    return this.authService.authenticate(input, 'admin');
  }

  @Post('/signup')
  signUp(@Body(ValidationPipe) input: SignUpDataDto) {
    return this.authService.signup(input);
  }

  @Post('/singup-admin')
  @UseGuards(AdminGuard)
  @Role(ROLE.ADMIN)
  signupAdmin() {
    return;
  }

  @Post('/singup-parish')
  @UseGuards(AdminGuard)
  @Role(ROLE.ADMIN)
  @Role(ROLE.ENGENEER)
  signupParish(@Body(ValidationPipe) input: SignUpParish, @Request() request) {
    return this.authService.signupParish(input, request);
  }

  @Post('/refreshToken')
  refreshToken(@Body(ValidationPipe) refreshToken: RefreshToken) {
    return this.authService.refreshToken(refreshToken);
  }
}
