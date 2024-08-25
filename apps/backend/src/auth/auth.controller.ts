import {
  Body,
  Controller,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorator/public.decorator';
import { AuthGuard } from './guard/auth.guards';
import { LoginDataDto } from './dto/login.dto';
import { SignUpDataDto } from './dto/signup.dto';
import { RefreshToken } from './dto/refreshToken.dto';

@Controller('auth')
@UseGuards(AuthGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login-parish')
  @Public()
  loginParish(@Body(ValidationPipe) input: LoginDataDto) {
    return this.authService.authenticate(input, 'parish');
  }

  @Post('/login-admin')
  @Public()
  loginAdmin(@Body(ValidationPipe) input: LoginDataDto) {
    return this.authService.authenticate(input, 'admin');
  }

  @Post('/signup')
  @Public()
  signUp(@Body(ValidationPipe) input: SignUpDataDto) {
    return this.authService.signup(input);
  }

  @Post('/refreshToken')
  @Public()
  refreshToken(@Body(ValidationPipe) refreshToken: RefreshToken) {
    return this.authService.refreshToken(refreshToken);
  }
}
