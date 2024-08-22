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
}
