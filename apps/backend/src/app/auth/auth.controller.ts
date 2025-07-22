import {
  Body,
  Controller,
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
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiPreconditionFailedResponse,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role, User } from '@prisma/client';
import { Request, Response } from 'express';
import { SkipAuth } from './auth.decorator';
import {
  AccessTokenResponse,
  AuthTokensDto,
  LoginDataDto,
  SignUpDto,
} from './auth.dto';
import { AuthService } from './auth.service';
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
  async signUp(
    @Body() newUser: SignUpDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const requestedUser = req.user as User;

    const user = await this.authService.registerUser(newUser);

    if (requestedUser && requestedUser.role === Role.ADMIN) {
      res.status(HttpStatus.CREATED).json({
        message: 'User created successfully!',
      });
    } else {
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
