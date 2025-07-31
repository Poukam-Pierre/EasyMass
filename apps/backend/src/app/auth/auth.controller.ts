import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiPreconditionFailedResponse,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { OtpUsage, Role, User } from '@prisma/client';
import { Request, Response } from 'express';
import { OTPEntity, OTPPayloadDto } from '../two-fa/two-fa.dto';
import { SkipAuth } from './auth.decorator';
import {
  AccessTokenResponse,
  AuthTokensDto,
  ForgotPasswordDto,
  LoginDataDto,
  ResetPasswordDto,
  SignUpDto,
} from './auth.dto';
import { AuthService } from './auth.service';
import { IJWTPayload } from './jwt/jwt.strategy';
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
  async login(@Req() req: Request, @Res() res: Response) {
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

  @SkipAuth(false)
  @Post('sign-up')
  @ApiCreatedResponse({ type: AccessTokenResponse })
  @ApiOperation({
    summary: 'Create a new user',
  })
  @ApiConflictResponse({
    description:
      'Conflict, user email is already registered with another account.',
  })
  async signUp(@Body() newUser: SignUpDto, @Res() res: Response) {
    const user = await this.authService.registerUser(newUser);

    const tokens = await this.authService.login(user);

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

  @Post('/refresh-token')
  @ApiBadRequestResponse({ type: AccessTokenResponse })
  @ApiOperation({
    summary: 'Refresh the access token',
  })
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      res.status(HttpStatus.FORBIDDEN).json({
        statusCode: 403,
        timestamp: new Date().toISOString(),
        message: 'Refresh token not found.',
        path: req.url,
      });
    } else {
      const tokens = await this.authService.refreshAuthToken(refreshToken);

      this.setCookies(tokens, res);

      res.status(HttpStatus.CREATED).json(
        new AccessTokenResponse({
          access_token: tokens.access_token,
          expires_in: 900000, //15 minutes,
          issued_at: tokens.issued_at,
          token_type: 'Bearer',
        }),
      );
    }
  }

  @SkipAuth(false)
  @ApiBearerAuth()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Req() req: Request, @Body() otpPayload: OTPPayloadDto) {
    const user = req.user as User;

    const verifyedUser = await this.authService.verifyEmail(
      user,
      otpPayload.code,
    );

    return verifyedUser;
  }

  @Post('forgot-password')
  @ApiCreatedResponse({ type: OTPEntity })
  @ApiOperation({
    summary: 'Request for reset password OTP.',
  })
  async requestTwoFA(@Body() payload: ForgotPasswordDto) {
    const otp = await this.authService.requestForgotPasswordOTP(payload.email);

    return new OTPEntity({ ...otp, usage: otp.usage as OtpUsage });
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiCreatedResponse({
    schema: { properties: { messaage: { type: 'string' } } },
  })
  @ApiOperation({
    summary: 'Close user session.',
  })
  async logout(@Req() req: Request, @Res() res: Response) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(HttpStatus.OK).json({ message: 'Logged out successfully' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = this.jwtService.decode<IJWTPayload>(token);
    // update database
    await this.authService.logout(payload.sub);

    // clear credentials from cookies
    res.clearCookie('refresh_token');

    res.status(HttpStatus.OK).json({ message: 'Logged out successfully' });
  }

  @Post('/reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async resetPassword(@Body() payload: ResetPasswordDto) {
    await this.authService.resetPassword(payload);
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
}
