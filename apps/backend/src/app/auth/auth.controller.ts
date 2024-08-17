import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login-v1')
  loginV1(@Body() input: { email: string; password: string }) {
    return this.authService.authenticateParish(input);
  }

  @Post('/login-v2')
  loginV2(@Body() input: { email: string; password: string }) {
    return this.authService.authenticateAdmin(input);
  }
}
