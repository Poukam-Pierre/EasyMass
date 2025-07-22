import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { IJWTPayload, TokenType } from './jwt/jwt.strategy';
import { OtpUsage, User } from '@prisma/client';
import { AuthTokensDto, SignUpDto } from './auth.dto';
import { OTPService } from '../two-fa/otp/otp.service';

@Injectable()
export class AuthService {
  private static readonly ACCESS_TOKEN_TYPE: TokenType = 'access_token';
  private static readonly REFRESH_TOKEN_TYPE: TokenType = 'refresh_token';

  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly otpService: OTPService,
  ) {}

  /**
   * Validate a user with the given email and password.
   * @param request the request used to get the subdomain to authenticate from
   * @param email the email of the user to validate
   * @param password the password of the user to validate
   * @returns the user if the authentication is successful, null otherwise
   */
  async validateUser(
    request: Request,
    email: string,
    password: string,
  ): Promise<User | null> {
    const person = await this.prismaService.user.findFirst({
      where: { email },
    });
    if (
      person &&
      person.password &&
      bcrypt.compareSync(password, person.password)
    ) {
      const subdomain = new URL(request.headers.origin as string).host;

      this.logger.debug(`Authentication user from origin ${subdomain}...`);

      if (subdomain) return { ...person };
    }
    return null;
  }

  /**
   * This function validates the jwt payload and retrieve the user data.
   * @param payload the jwt payload
   * @param type the type of the token, default is access_token
   * @returns the user data
   * @throws UnprocessableEntityException when the token type is invalid
   * @throws NotFoundException when the user is not found
   */
  async validateJwtPayload(
    payload: IJWTPayload,
    type: TokenType = AuthService.ACCESS_TOKEN_TYPE,
  ): Promise<User> {
    if (payload.type !== type)
      throw new UnprocessableEntityException('Invalid token type!');

    const person = await this.prismaService.user.findUnique({
      where: { user_id: payload.sub },
    });
    if (!person) throw new NotFoundException('Invalid token payload!');
    return { ...person };
  }

  /**
   * Authenticates a user and generates JWT tokens.
   * @param user The user to authenticate.
   * @returns An instance of AuthTokensDto containing the refresh and access tokens,
   *          the issuance date, and optionally an OTP ID.
   * @throws NotFoundException if the user is not found.
   */
  async login(user: User): Promise<AuthTokensDto> {
    let otpId: string | undefined;
    if (!user.is_account_verified) {
      this.logger.debug('Request otp for user...');

      const otpCode = await this.otpService.request(
        user.user_id,
        OtpUsage.VERIFY_EMAIL,
      );

      // TODO: send otp by email
      otpId = otpCode.otp_id;
      this.logger.debug('Successfully sent requested opt user by mail:', otpId);
    }

    // create login log
    await this.prismaService.log.create({
      data: {
        User: {
          connect: {
            user_id: user.user_id,
          },
        },
      },
    });
    return this.generateTokens(user.user_id, otpId);
  }

  /**
   * Registers a new user in the system.
   * @param payload The new user's data.
   * @param createdBy The user ID of the user who created the new user.
   * @returns The newly created user.
   * @throws ConflictException if the email address is already taken.
   */
  async registerUser(
    { password, birthdate, ...payload }: SignUpDto,
    createdBy?: string,
  ): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: payload.email,
      },
    });

    if (user) throw new ConflictException('Email address already taken');

    const newUser = await this.prismaService.user.create({
      data: {
        ...payload,
        birthdate: birthdate ? new Date(birthdate) : undefined,
        password: bcrypt.hashSync(
          password,
          bcrypt.genSaltSync(
            Number(this.configService.get<number>('SALT_ROUNDS')),
          ),
        ),
        CreatedBy: createdBy ? { connect: { user_id: createdBy } } : undefined,
      },
    });

    return newUser;
  }

  /**
   * Generates JWT tokens for a user.
   * @param userId - The ID of the user for whom to generate tokens.
   * @param otpId - Optional one-time password identifier for unverified accounts.
   * @returns An instance of AuthTokensDto containing the refresh and access tokens,
   *          the issuance date, and optionally an OTP ID.
   */
  private async generateTokens(userId: string, otpId?: string) {
    const refreshToken = this.jwtService.sign(
      { sub: userId, type: AuthService.REFRESH_TOKEN_TYPE },
      { expiresIn: '24h' },
    );
    const accessToken = this.jwtService.sign(
      { sub: userId, type: AuthService.ACCESS_TOKEN_TYPE },
      { expiresIn: '24h' },
    );

    return new AuthTokensDto({
      refresh_token: refreshToken,
      access_token: accessToken,
      issued_at: Date.now(),
      otp_id: otpId,
    });
  }

  /**
   * Generates new JWT tokens based on a valid refresh token.
   * @param refreshToken - The refresh token to use when generating new tokens.
   * @returns An instance of AuthTokensDto containing the new refresh and access tokens,
   *          the issuance date, and optionally an OTP ID.
   * @throws UnauthorizedException if the refresh token is invalid or the token payload is invalid.
   */
  async refreshAuthToken(refreshToken: string) {
    let payload: IJWTPayload;
    const type = AuthService.REFRESH_TOKEN_TYPE;

    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_SECRET'),
      });
    } catch (error) {
      // TODO: log user out if refresh token is invalid
      console.log('refresh token is invalid', error);
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.type !== type)
      throw new UnauthorizedException('Invalid token type!');

    const log = await this.prismaService.log.findFirst({
      orderBy: { login_at: 'desc' },
      where: {
        logout_at: null,
        User: { user_id: payload.sub },
      },
    });

    if (!log) throw new UnauthorizedException('Invalid token payload!');

    return this.generateTokens(payload.sub);
  }

  /**
   * Verifies the email address of a user by OTP.
   *
   * @param user The user to verify email address for.
   * @param code The OTP code sent to the user's email address.
   *
   * @throws NotFoundException if the OTP request is invalid.
   * @throws UnauthorizedException if the OTP code is invalid.
   * @returns The user with the verified email address.
   */
  async verifyEmail(user: User, code: string) {
    const otp = await this.prismaService.oTP.findFirst({
      orderBy: { created_at: 'desc' },
      where: {
        User: { user_id: user.user_id },
        usage: OtpUsage.VERIFY_EMAIL,
      },
    });

    if (!otp) {
      throw new NotFoundException(
        'Invalid OTP request was found! Please request for a new one.',
      );
    }

    const isVerified = await this.otpService.verify(
      otp.otp_id,
      code,
      OtpUsage.VERIFY_EMAIL,
    );

    if (!isVerified)
      throw new UnauthorizedException('Invalid onetime password!');

    return await this.prismaService.user.update({
      where: { email: user.email },
      data: { is_account_verified: true },
    });
  }

  /**
   * Request a one-time password for password reset.
   * @param email the email address of the user to request a password reset for
   * @returns the OTP entity
   * @throws NotFoundException if the user is not found
   */
  async requestForgotPasswordOTP(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) throw new NotFoundException('User not found!');

    const otp = await this.otpService.request(
      user.user_id,
      OtpUsage.RESET_PASSWORD,
    );

    // TODO: Send otp by mail

    return otp;
  }

  /**
   * Logs out a user by updating their login log with the current date and time.
   * @param userId - The ID of the user to log out.
   */
  async logout(userId: string) {
    await this.prismaService.log.updateMany({
      data: { logout_at: new Date() },
      where: { user_id: userId, logout_at: null },
    });
  }

  // /**
  //  * This function is responsible to reset the password of the user
  //  * @param input
  //  * @returns
  //  */
  // async resetPassword(input: ResetPasswordDto, request:Request) {
  //   const { newPassword, token } = input;
  //   const origin = request.headers['origin'];
  //   const subdomain = origin ? new URL(origin).hostname.split('.')[0] : null;

  //   try {
  //     const otp = await this.prismaService.otp.findFirst({
  //       where: {
  //         code: token,
  //         isUsed: false,
  //         expiredAt: {
  //           gte: new Date(),
  //         },
  //       },
  //       select: {
  //         ...(subdomain === 'admin' && {
  //           admin: {
  //             select: {
  //               id: true,
  //             },
  //           },
  //         }),
  //         ...(subdomain === 'parish' && {
  //           parish: {
  //             select: {
  //               id: true,
  //             },
  //           },
  //         }),
  //       },
  //     });

  //     if (!otp) {
  //       throw new NotFoundException('oTPExpiredOrInvalid');
  //     }
  //     const hash = await bcrypt.hash(newPassword, 10);

  //     if (subdomain === 'admin') {
  //       await this.adminService.update(otp.admin.id, {
  //         password: hash,
  //       });
  //     }

  //     if (subdomain === 'parish') {
  //       await this.parishService.updateParish(otp.admin.id, {
  //         password: hash,
  //       });
  //     }

  //     return {
  //       statusCode: 200,
  //       message: 'passwordChanged',
  //     };
  //   } catch (error) {
  //     console.log('Error while resetting password', error);
  //     if (error instanceof NotFoundException) {
  //       throw new NotFoundException(error.message);
  //     }
  //     throw new InternalServerErrorException('serverError');
  //   }
  // }
}
