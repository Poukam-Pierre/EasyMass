import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorator/public.decorator';
import { AuthGuard } from './guard/auth.guards';

@Controller('auth')
@UseGuards(AuthGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login-v1')
  loginV1(@Body() input: { email: string; password: string }) {
    return this.authService.authenticateParish(input);
  }

  @Public()
  @Post('/login-v2')
  loginV2(@Body() input: { email: string; password: string }) {
    return this.authService.authenticateAdmin(input);
  }
}
