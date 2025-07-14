import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createId } from '@paralleldrive/cuid2';
// import * as bcrypt from 'bcryptjs';
// import { AdministratorService } from '../administrator/administrator.service';
// import { ParishService } from '../parish/parish.service';
// import { PriestService } from '../priest/priest.service';
// import { PrismaService } from '../prisma/prisma.service';
// import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/forgotPassword';
import {
  AdminDataDto,
  LoginDataDto,
  LogoutDataDto,
  PriestDataDto,
} from './dto/login.dto';
import { NewTokens, RefreshToken } from './dto/refreshToken.dto';
import { SignUpAdminDto, SignUpDataDto } from './dto/signup.dto';
import { ParishService } from '../../modules/parish/parish.service';
import { AdministratorService } from '../../modules/administrator/administrator.service';
import { PriestService } from '../../modules/priest/priest.service';
import { RefreshTokenService } from '../../modules/refresh-token/refresh-token.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';


@Injectable()
export class AuthService {
  constructor(
    private readonly JwtService: JwtService,
    private readonly parishService: ParishService,
    private readonly adminService: AdministratorService,
    private readonly priestService: PriestService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly prismaService: PrismaService
  ) {}

  // /**
  //  * This function authenticate the users when login
  //  * @param input
  //  * @param role
  //  * @returns all data needed.
  //  */
  // async authenticate(input: LoginDataDto, request:Request) {
  //   const origin = request.headers['origin'];
  //   const subdomain = origin ? new URL(origin).hostname.split('.')[0] : null;

  //   try {
  //     const user = await this.validateUser(input, subdomain as string);

  //     if (!user) {
  //       throw new UnauthorizedException('unauthorized');
  //     }

  //     if (user === 'Logged') {
  //       throw new ConflictException('conflictLogin');
  //     }

  //     // Set up payload according to the subdomaine name
  //     const tokenPayload = {
  //       id: user.id,
  //       email: user.email,
  //       ...(subdomain === 'admin' && {
  //         role: user.role,
  //       }),
  //     };

  //     const accessToken = await this.JwtService.signAsync(tokenPayload);
  //     const refreshToken = createId();

  //     // create refresh-token record
  //     await this.refreshTokenService.create({
  //       id: createId(),
  //       refreshToken: refreshToken,
  //       expiredDate: this.addOneDay(new Date()),
  //       ...(subdomain === 'parish' && {
  //         parishToken: {
  //           connect: {
  //             id: user.id,
  //           },
  //         },
  //       }),
  //       ...(subdomain === 'admin' && {
  //         adminToken: {
  //           connect: {
  //             id: user.id,
  //           },
  //         },
  //       }),
  //     });

  //     return {
  //       statusCode: 200,
  //       accessToken,
  //       refreshToken,
  //     };
  //   } catch (error) {
  //     console.log('Error while authenticating user :', error);
  //     if (error instanceof ConflictException) {
  //       throw new ConflictException(error.message);
  //     }
  //     if (error instanceof UnauthorizedException) {
  //       throw new UnauthorizedException(error.message);
  //     }
  //     throw new InternalServerErrorException('serverError');
  //   }
  // }

  // /**
  //  * This function validate weither the parish user exists in db or not.
  //  * Also check weither all user's credentials are valid or not.
  //  * @param input
  //  * @returns
  //  */
  // async validateUser(input: LoginDataDto, subdomain: string) {
  //   const { email, password } = input;
  //   let user = null;
  //   const userId = {
  //     adminId: null,
  //     parishId: null,
  //   };

  //   try {
  //     if (subdomain === 'admin') {
  //       user = await this.adminService.findOneByMail(email);
  //       if (!user) return null;
  //       userId['adminId'] = user.id;
  //     }

  //     if (subdomain === 'parish') {
  //       user = await this.parishService.findOneByMail(email);
  //       if (!user) return null;
  //       userId['parishId'] = user.id;
  //     }

  //     const { refreshToken } = await this.refreshTokenService.findFirstToken(
  //       userId
  //     );

  //     if (refreshToken && Object.values(refreshToken).length !== 0) {
  //       if (refreshToken.createdAt >= new Date()) {
  //         return 'Logged';
  //       } else {
  //         await this.refreshTokenService.remove(refreshToken.id);
  //       }
  //     }

  //     const validatePassword = await bcrypt.compare(password, user.password);
  //     if (!validatePassword) {
  //       return null;
  //     }
  //     return user;
  //   } catch (error) {
  //     console.log('Error appear while validating user credential :', error);
  //     throw new InternalServerErrorException('serverError');
  //   }
  // }

  // /**
  //  * This function passes the input to the other validation function
  //  * and just wait for the result to perform error actions. If any error occurs
  //  * the function passes the result to signIn function and returns the result.
  //  * to client side.
  //  * @param input
  //  * @returns successfull result object
  //  */
  // async signupAdmin(input: SignUpAdminDto): Promise<AdminDataDto | unknown> {
  //   const user = await this.signupAdminValidation(input);

  //   if (!user) {
  //     throw new BadRequestException('Bad Request', {
  //       cause: new Error(),
  //       description: 'This account is already in use.',
  //     });
  //   }
  //   return { code: 200, message: 'New administrator created successfully' };
  // }

  // /**
  //  * This function verifies the input from the db server. If the input exists,
  //  * the function returns null. If the input does not exist, the function hash password
  //  * and creates a new user account. Then returns the user object created.
  //  * @param input
  //  * @returns null or user object created
  //  */
  // async signUpPriestValidation(
  //   input: SignUpDataDto
  // ): Promise<PriestDataDto | null> {
  //   const { email, password, authNumber } = input;

  //   const user = await this.priestService.findOneByAuthNumber(
  //     email,
  //     authNumber
  //   );
  //   if (user) return null;

  //   try {
  //     const hash = await bcrypt.hash(password, 10);
  //     input.password = hash;

  //     const newUser = await this.priestService.create(input);
  //     delete newUser.password;
  //     delete newUser.updatedAt;

  //     return newUser;
  //   } catch (error) {
  //     throw new InternalServerErrorException('serverError', {
  //       cause: new Error(),
  //       description:
  //         'Error appears while processing hash and create new user into db.',
  //     });
  //   }
  // }

  // /**
  //  * This function verifies the input from the db server. If the input exists,
  //  * the function returns null. If the input does not exist, the function hash password
  //  * and creates a new admin user account. Then returns the user object created.
  //  * @param input
  //  * @returns
  //  */
  // async signupAdminValidation(
  //   input: SignUpAdminDto
  // ): Promise<AdminDataDto | null> {
  //   const { email, password } = input;
  //   const user = await this.adminService.findOneByMail(email);

  //   if (user) return null;

  //   try {
  //     const hash = await bcrypt.hash(password, 10);
  //     input.password = hash;

  //     const newUser = await this.adminService.create(input);
  //     delete newUser.password;
  //     delete newUser.updatedAt;

  //     return newUser;
  //   } catch (error) {
  //     throw new InternalServerErrorException('serverError');
  //   }
  // }

  // /**
  //  * This function verifies if refreshToken exists from the refreshToken server.
  //  * If not, responds with an error unauthorised else return a new access token
  //  * and refresh token which will be stored in the database
  //  * @param input all data received from client
  //  * @returns  an object containing access token and refresh token
  //  */
  // async refreshToken(input: RefreshToken): Promise<NewTokens> {
  //   const refreshData = await this.refreshTokenService.findOne(
  //     input.refreshToken
  //   );

  //   if (!refreshData) {
  //     throw new UnauthorizedException('Unauthorized refresh token', {
  //       cause: new Error(),
  //       description: 'User not authorized to refresh token!',
  //     });
  //   }

  //   if (new Date(refreshData.expiredDate) <= new Date()) {
  //     await this.refreshTokenService.remove(refreshData.id);

  //     throw new UnauthorizedException('Unauthorized refresh token', {
  //       cause: new Error(),
  //       description: 'Refresh token expired. Please login!',
  //     });
  //   }

  //   try {
  //     const accessToken = await this.JwtService.signAsync({
  //       id: input.id,
  //       email: input.email,
  //     });
  //     const newRefreshToken = createId();

  //     await this.refreshTokenService.update(refreshData.id, {
  //       refreshToken: newRefreshToken,
  //     });

  //     return {
  //       accessToken: accessToken,
  //       refreshToken: newRefreshToken,
  //     };
  //   } catch (error) {
  //     console.log('Error appear while refreshing token :', error);
  //     if (error instanceof BadRequestException) {
  //       throw new UnauthorizedException(error.message);
  //     }
  //     throw new InternalServerErrorException('serverError');
  //   }
  // }

  // /**
  //  * This function verifies if refreshToken exists from the refreshToken server.
  //  * If not, responds with an error unauthorised else delete the refreshToken data
  //  * corresponding to the refreshToken user and retrun successfully message.
  //  * @param refreshToken
  //  * @returns
  //  */
  // async logout(input: LogoutDataDto) {
  //   const { refreshToken } = input;
  //   try {
  //     const refreshData = await this.refreshTokenService.findOne(refreshToken);

  //     if (!refreshData) {
  //       throw new UnauthorizedException('unauthorizerRefreshToken');
  //     }
  //     await this.refreshTokenService.remove(refreshData.id);

  //     return { code: 200, message: 'Disconnect token successfully!' };
  //   } catch (error) {
  //     console.log('Error arise while disconnection');
  //     if (error instanceof UnauthorizedException) {
  //       throw new UnauthorizedException(error.message);
  //     }
  //     throw new InternalServerErrorException('serverError');
  //   }
  // }

  // /**
  //  * This function is responsible to add days in the actual one.
  //  * @param date
  //  * @returns  a future object date.
  //  */
  // private addOneDay(date: Date): Date {
  //   const newDate = new Date(date);
  //   newDate.setDate(newDate.getDate() + 1);
  //   return newDate;
  // }

  // /**
  //  * This function is responsible to send a password reset email to the user
  //  * @param input
  //  * @returns
  //  */
  // async forgotPassword(input: ForgotPasswordDto, request:Request) {
  //   const origin = request.headers['origin'];
  //   const subdomain = origin ? new URL(origin).hostname.split('.')[0] : null;

  //   const { email } = input;
  //   let user;
  //   const userId = {};
  //   try {
  //     if (subdomain === 'admin') {
  //       user = await this.adminService.findOneByMail(email);
  //       if (!user) throw new NotFoundException('notFound');

  //       userId['adminId'] = user.id;
  //     }

  //     if (subdomain === 'parish') {
  //       user = await this.parishService.findOneByMail(email);
  //       if (!user) throw new NotFoundException('notFound');

  //       userId['adminId'] = user.id;
  //     }

  //     // update all previous OTPs to isUsed = true
  //     await this.prismaService.otp.updateMany({
  //       where: userId,
  //       data: {
  //         isUsed: true,
  //       },
  //     });

  //     const { code } = await this.prismaService.otp.create({
  //       data: {
  //         otp_id: createId(),
  //         code: createId(),
  //         isUsed: false,
  //         expiredAt: new Date(new Date().getTime() + 10 * 60000), // 10 minutes from now
  //         ...(subdomain === 'admin' && {
  //           admin: {
  //             connect: {
  //               id: user.id,
  //             },
  //           },
  //         }),
  //         ...(subdomain === 'parish' && {
  //           parish: {
  //             connect: {
  //               id: user.id,
  //             },
  //           },
  //         }),
  //       },
  //     });
  //     const OTP_MESSAGE = `Dear ${user.name},
  //     We have received a request to reset your password. Please use the following link to reset your password:
  
  //     ${
  //       subdomain === 'admin'
  //         ? process.env.NEXT_PUBLIC_ADMIN_URL
  //         : process.env.NEXT_PUBLIC_PARISH_URL
  //     }/recovery/${code}/new-password
      
  //     If you did not request this, please ignore this email.
  //     This link will expire in 10 minutes.
      
  //     Thank you,
  //     Your Team`;
  //     // TODO: send email to the user with OTP_MESSAGE
  //     console.log(OTP_MESSAGE);

  //     return {
  //       statusCode: 200,
  //       message: 'otpSend',
  //     };
  //   } catch (error) {
  //     console.log('Error while resetting password', error);
  //     if (error instanceof NotFoundException) {
  //       throw new NotFoundException(error.message);
  //     }
  //     throw new InternalServerErrorException('serverError');
  //   }
  // }

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
