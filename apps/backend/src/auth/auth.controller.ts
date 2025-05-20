import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Role, ROLE } from './decorator/public.decorator';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/forgotPassword';
import { LoginDataDto, LogoutDataDto } from './dto/login.dto';
import { RefreshToken } from './dto/refreshToken.dto';
import { SignUpAdminDto } from './dto/signup.dto';
import { AdminGuard } from './guard/admin.guards';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({
    summary: 'Login parishes',
  })
  @ApiResponse({
    status: 401,
    description: 'Wrong email or password.',
  })
  @ApiResponse({
    status: 409,
    description: 'Account already logged in. Logout before from the first one.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @Post('/login')
  loginParish(@Body() input: LoginDataDto, @Req() request) {
    return this.authService.authenticate(input, request);
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

  @Post('/refreshToken')
  refreshToken(@Body() refreshToken: RefreshToken) {
    return this.authService.refreshToken(refreshToken);
  }

  @ApiOperation({
    summary: 'Logout the user',
    description:
      'This endpoint logs out the user by invalidating the provided refresh token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid refresh token.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error appears while logging out.',
  })
  @Post('/logout')
  logout(@Body() input: LogoutDataDto) {
    return this.authService.logout(input);
  }

  @ApiOperation({
    summary: 'Send a password reset email to the user',
    description:
      'This endpoint sends a password reset email to the user with the provided email address.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid email address.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error appears while sending password reset email.',
  })
  @Post('/forgot-password')
  forgotPassword(@Body() input: ForgotPasswordDto, @Req() request) {
    return this.authService.forgotPassword(input, request);
  }

  // TODO: Upon deployement remove this logic and
  // use request host to know what link is currently requesting

  @ApiOperation({
    summary: 'Reset the user password',
    description:
      'This endpoint resets the user password using the provided token and new password.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid token or password.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error appears while resetting password.',
  })
  @Post('/reset-password')
  resetPassword(@Body() input: ResetPasswordDto, @Req() request) {
    return this.authService.resetPassword(input, request);
  }
}
