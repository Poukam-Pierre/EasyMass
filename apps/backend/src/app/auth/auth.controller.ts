import { Controller, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiPreconditionFailedResponse,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Request, Response } from 'express';
import { SkipAuth } from './auth.decorator';
import { AccessTokenResponse, AuthTokensDto } from './auth.dto';
import { AuthService } from './auth.service';
import { LoginDataDto } from './dto/login.dto';
import { LocalGuard } from './local/local.guard';

@SkipAuth()
@Controller('auth')
@ApiTags('Authentication')
@ApiBadRequestResponse({
  description:
    'Bad request. This often happens when the request payload it not respected.',
})
@ApiInternalServerErrorResponse({
  description: 'Internal server error. An unexpected exception was thrown',
})
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({
    summary: 'Login to authenticate a user',
  })
  @ApiResponse({
    status: 401,
    description: 'Wrong email or password.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized request. Incorrect email or password.',
  })
  @ApiPreconditionFailedResponse({
    description:
      'Precondition failed, user account must be actived before login.',
  })
  @Post('/login')
  @UseGuards(LocalGuard)
  @ApiBody({ type: LoginDataDto })
  @ApiCreatedResponse({ type: AccessTokenResponse })
  async login(@Req() req: Request, res: Response) {
    const tokens = await this.authService.login(req.user as User);

    // setnew Htp-Only cookies
    this.setCookies(tokens, res);

    res.status(HttpStatus.CREATED).json(
      new AccessTokenResponse({
        access_token: tokens.access_token,
        expires_in: 900000, //15 minutes,
        issued_at: tokens.issued_at,
        token_type: 'Bearer',
        otp_id: tokens.otp_id,
      }),
    );
  }

  /**
   * Set the refresh token cookie on the response.
   * @param tokens the tokens from the login response
   * @param res the response object
   */
  private setCookies(tokens: AuthTokensDto, res: Response) {
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 1 days
    });
  }
  // @Post('/signup-admin')
  // @Role(ROLE.ADMIN)
  // @UseGuards(AdminGuard)
  // signupAdmin(
  //   @Body()
  //   input: SignUpAdminDto,
  // ) {
  //   return this.authService.signupAdmin(input);
  // }

  // @Post('/refreshToken')
  // refreshToken(@Body() refreshToken: RefreshToken) {
  //   return this.authService.refreshToken(refreshToken);
  // }

  // @ApiOperation({
  //   summary: 'Logout the user',
  //   description:
  //     'This endpoint logs out the user by invalidating the provided refresh token.',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Logout successful.',
  // })
  // @ApiResponse({
  //   status: 400,
  //   description: 'Invalid refresh token.',
  // })
  // @ApiResponse({
  //   status: 500,
  //   description: 'Error appears while logging out.',
  // })
  // @Post('/logout')
  // logout(@Body() input: LogoutDataDto) {
  //   return this.authService.logout(input);
  // }

  // @ApiOperation({
  //   summary: 'Send a password reset email to the user',
  //   description:
  //     'This endpoint sends a password reset email to the user with the provided email address.',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Password reset email sent successfully.',
  // })
  // @ApiResponse({
  //   status: 400,
  //   description: 'Invalid email address.',
  // })
  // @ApiResponse({
  //   status: 404,
  //   description: 'User not found.',
  // })
  // @ApiResponse({
  //   status: 500,
  //   description: 'Error appears while sending password reset email.',
  // })
  // @Post('/forgot-password')
  // forgotPassword(@Body() input: ForgotPasswordDto, @Req() request: Request) {
  //   return this.authService.forgotPassword(input, request);
  // }

  // // TODO: Upon deployement remove this logic and
  // // use request host to know what link is currently requesting

  // @ApiOperation({
  //   summary: 'Reset the user password',
  //   description:
  //     'This endpoint resets the user password using the provided token and new password.',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Password reset successfully.',
  // })
  // @ApiResponse({
  //   status: 400,
  //   description: 'Invalid token or password.',
  // })
  // @ApiResponse({
  //   status: 500,
  //   description: 'Error appears while resetting password.',
  // })
  // @Post('/reset-password')
  // resetPassword(@Body() input: ResetPasswordDto, @Req() request: Request) {
  //   return this.authService.resetPassword(input, request);
  // }
}
