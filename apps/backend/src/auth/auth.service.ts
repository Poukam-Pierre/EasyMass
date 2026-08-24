import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createId } from '@paralleldrive/cuid2';
import * as bcrypt from 'bcryptjs';
import { AdministratorService } from '../administrator/administrator.service';
import { ParishService } from '../parish/parish.service';
import { PriestService } from '../priest/priest.service';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import {
  AdminDataDto,
  LoginDataDto,
  ParishDataDto,
  PriestDataDto,
} from './dto/login.dto';
import { NewTokens, RefreshToken } from './dto/refreshToken.dto';
import { SignUpAdminDto, SignUpDataDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly JwtService: JwtService,
    private readonly parishService: ParishService,
    private readonly adminService: AdministratorService,
    private readonly priestService: PriestService,
    private readonly refreshTokenService: RefreshTokenService
  ) {}

  /**
   * This function authenticate the users when login
   * @param input
   * @param role
   * @returns all data needed.
   */
  async authenticate(
    input: LoginDataDto,
    role: string
  ): Promise<ParishDataDto | AdminDataDto | PriestDataDto> {
    if (role === 'parish') {
      const user = await this.validateParish(input);

      if (!user) {
        throw new UnauthorizedException('Unauthorized', {
          cause: new Error(),
          description: 'Wrong email or password.',
        });
      }

      if (user === 'Logged') {
        throw new ConflictException('Conflict', {
          cause: new Error(),
          description:
            'Account already logged in. Logout before from the first one.',
        });
      }

      return this.signIn(user as ParishDataDto, role);
    } else if (role === 'admin') {
      const user = await this.validateAdmin(input);

      if (!user) {
        throw new UnauthorizedException('Unauthorized', {
          cause: new Error(),
          description: 'Wrong email or password.',
        });
      }

      if (user === 'Logged') {
        throw new ConflictException('Conflict', {
          cause: new Error(),
          description:
            'Account already logged in. Logout before from the first one.',
        });
      }

      return this.signInAdmin(user as AdminDataDto);
    } else {
      const user = await this.validatePriest(input);

      if (!user) {
        throw new UnauthorizedException('Unauthorized', {
          cause: new Error(),
          description: 'Wrong email or password.',
        });
      }

      if (user === 'Logged') {
        throw new ConflictException('Conflict', {
          cause: new Error(),
          description:
            'Account already logged in. Logout before from the first one.',
        });
      }

      return this.signIn(user as PriestDataDto, role);
    }
  }

  /**
   * This function validate weither the parish user exists in db or not.
   * Also check weither all user's credentials are valid or not.
   * @param input
   * @returns
   */
  async validateParish(
    input: LoginDataDto
  ): Promise<ParishDataDto | null | string> {
    const { email, password } = input;

    const user = await this.parishService.findOneByMail(email);

    if (!user) {
      return null;
    }

    const existingRefreshToken = (
      await this.refreshTokenService.findAll()
    ).find((token) => token.userId === user.userId);

    if (existingRefreshToken) {
      if (new Date() <= new Date(existingRefreshToken.expiredDate)) {
        return 'Logged';
      } else {
        await this.refreshTokenService.remove(existingRefreshToken.id);
      }
    }

    try {
      const validatePassword = await bcrypt.compare(password, user.password);
      if (validatePassword) {
        return new ParishDataDto(user);
      } else return null;
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error', {
        cause: new Error(),
        description: 'Error appears while processing your request.',
      });
    }
  }

  /**
   * This function validate weither the admin user exists in db or not.
   * Also check weither all user's credentials are valid or not.
   * @param input
   * @returns
   */
  async validateAdmin(
    input: LoginDataDto
  ): Promise<AdminDataDto | null | string> {
    const { email, password } = input;

    const user = await this.adminService.findOneByMail(email);

    if (!user) {
      return null;
    }

    const existingRefreshToken = (
      await this.refreshTokenService.findAll()
    ).find((token) => token.userId === user.userId);

    if (existingRefreshToken) {
      if (new Date() <= new Date(existingRefreshToken.expiredDate)) {
        return 'Logged';
      } else {
        await this.refreshTokenService.remove(existingRefreshToken.id);
      }
    }

    try {
      const validatePassword = await bcrypt.compare(password, user.password);

      if (validatePassword) {
        return new AdminDataDto(user);
      } else return null;
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error', {
        cause: new Error(),
        description: 'Error appears while processing your request.',
      });
    }
  }

  async validatePriest(
    input: LoginDataDto
  ): Promise<PriestDataDto | null | string> {
    const { email, password } = input;

    const user = await this.priestService.findOne(email);

    if (!user) {
      return null;
    }

    const existingRefreshToken = (
      await this.refreshTokenService.findAll()
    ).find((token) => token.userId === user.userId);

    if (existingRefreshToken) {
      if (new Date() <= new Date(existingRefreshToken.expiredDate)) {
        return 'Logged';
      } else {
        await this.refreshTokenService.remove(existingRefreshToken.id);
      }
    }

    try {
      const validatePassword = await bcrypt.compare(password, user.password);

      if (validatePassword) {
        return new PriestDataDto(user);
      } else return null;
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error', {
        cause: new Error(),
        description: 'Error appears while processing your request.',
      });
    }
  }

  /**
   *This function build a new token, update the db  when login and add them into data response object
   * @param user data object returned from validation function
   * @param role used to identify where process will be performed
   * @returns user object
   */
  async signIn(
    user: ParishDataDto | PriestDataDto,
    role: string
  ): Promise<ParishDataDto | PriestDataDto> {
    const id = role === 'parish' ? (user as ParishDataDto).parishId : (user as PriestDataDto).priestId;

    const tokenPayload = {
      id,
      email: user.email,
    };

    try {
      const accessToken = await this.JwtService.signAsync(tokenPayload);
      const refreshToken = createId();

      await this.refreshTokenService.create({
        id: createId(),
        refreshToken: refreshToken,
        expiredDate: this.addOneDay(new Date()),
        user: {
          connect: {
            userId: user.userId,
          },
        },
      });

      user.accessToken = accessToken;
      user.refreshToken = refreshToken;
      return user;
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error', {
        cause: new Error(),
        description:
          'Error appears while processing the creation of accessToken and refreshToken into db.',
      });
    }
  }

  /**
   * This function build a new token, update the db  when login and add them into data response object
   * @param user data object returned from validation function
   * @returns user object returned
   */
  async signInAdmin(user: AdminDataDto): Promise<AdminDataDto> {
    const tokenPayload = {
      id: user.adminId,
      email: user.email,
      role: user.role,
    };

    try {
      const accessToken = await this.JwtService.signAsync(tokenPayload);
      const refreshToken = createId();

      await this.refreshTokenService.create({
        id: createId(),
        refreshToken: refreshToken,
        expiredDate: this.addOneDay(new Date()),
        user: {
          connect: {
            userId: user.userId,
          },
        },
      });

      user.accessToken = accessToken;
      user.refreshToken = refreshToken;
      return user;
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error', {
        cause: new Error(),
        description:
          'Error appears while processing the creation of accessToken and refreshToken into db.',
      });
    }
  }

  /**
   * This function passes the input to the other validation function
   * and just wait for the result to perform error actions. If any error occurs
   * the function passes the result to signIn function and returns the result.
   * to client side.
   * @param input
   * @returns data need on client side
   */
  async signupPriest(input: SignUpDataDto): Promise<PriestDataDto | unknown> {
    const user = await this.signUpPriestValidation(input);

    if (!user) {
      throw new BadRequestException('Bad Request', {
        cause: new Error(),
        description: 'This account is already in use.',
      });
    }

    try {
      const userData = await this.priestService.findOne(user.email);
      return this.signIn(userData, 'priest');
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error', {
        cause: new Error(),
        description:
          'Error appears while processing signIn function data before found one.',
      });
    }
  }

  /**
   * This function passes the input to the other validation function
   * and just wait for the result to perform error actions. If any error occurs
   * the function passes the result to signIn function and returns the result.
   * to client side.
   * @param input
   * @returns successfull result object
   */
  async signupAdmin(input: SignUpAdminDto): Promise<AdminDataDto | unknown> {
    const user = await this.signupAdminValidation(input);

    if (!user) {
      throw new BadRequestException('Bad Request', {
        cause: new Error(),
        description: 'This account is already in use.',
      });
    }
    return { code: 200, message: 'New administrator created successfully' };
  }

  /**
   * This function verifies the input from the db server. If the input exists,
   * the function returns null. If the input does not exist, the function hash password
   * and creates a new user account. Then returns the user object created.
   * @param input
   * @returns null or user object created
   */
  async signUpPriestValidation(
    input: SignUpDataDto
  ): Promise<PriestDataDto | null> {
    const { email, password, authNumber, ...rest } = input;

    const exists = await this.priestService.findOneByAuthNumber(
      email,
      authNumber
    );
    if (exists) return null;

    try {
      const hash = await bcrypt.hash(password, 10);

      const newUser = await this.priestService.create(
        { ...rest, authNumber },
        email,
        hash
      );

      return this.priestService.findOne(newUser.user.email);
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error', {
        cause: new Error(),
        description:
          'Error appears while processing hash and create new user into db.',
      });
    }
  }

  /**
   * This function verifies the input from the db server. If the input exists,
   * the function returns null. If the input does not exist, the function hash password
   * and creates a new admin user account. Then returns the user object created.
   * @param input
   * @returns
   */
  async signupAdminValidation(
    input: SignUpAdminDto
  ): Promise<AdminDataDto | null> {
    const { email, password, ...rest } = input;
    const user = await this.adminService.findOneByMail(email);

    if (user) return null;

    try {
      const hash = await bcrypt.hash(password, 10);

      const newUser = await this.adminService.create(rest, email, hash);

      return this.adminService.findOneByMail(newUser.user.email);
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error', {
        cause: new Error(),
        description:
          'Error appears while processing hash and create new user admin into db.',
      });
    }
  }
  /**
   * This function verifies if refreshToken exists from the refreshToken server.
   * If not, responds with an error unauthorised else return a new access token
   * and refresh token which will be stored in the database
   * @param input all data received from client
   * @returns  an object containing access token and refresh token
   */
  async refreshToken(input: RefreshToken): Promise<NewTokens> {
    const refreshData = await this.refreshTokenService.findOne(
      input.refreshToken
    );

    if (!refreshData) {
      throw new UnauthorizedException('Unauthorized refresh token', {
        cause: new Error(),
        description: 'User not authorized to refresh token!',
      });
    }

    if (new Date(refreshData.expiredDate) <= new Date()) {
      await this.refreshTokenService.remove(refreshData.id);

      throw new UnauthorizedException('Unauthorized refresh token', {
        cause: new Error(),
        description: 'Refresh token expired. Please login!',
      });
    }

    try {
      const accessToken = await this.JwtService.signAsync({
        id: input.id,
        email: input.email,
      });
      const newRefreshToken = createId();

      await this.refreshTokenService.update(refreshData.id, {
        refreshToken: newRefreshToken,
      });

      return {
        accessToken: accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error', {
        cause: new Error(),
        description:
          'Error appears while processing the creation accessToken and update refreshToken into db.',
      });
    }
  }

  /**
   * This function verifies if refreshToken exists from the refreshToken server.
   * If not, responds with an error unauthorised else delete the refreshToken data
   * corresponding to the refreshToken user and retrun successfully message.
   * @param refreshToken
   * @returns
   */
  async logout(refreshToken: string) {
    const refreshData = await this.refreshTokenService.findOne(refreshToken);
    if (!refreshData) {
      throw new UnauthorizedException('Unauthorized refresh token', {
        cause: new Error(),
        description: 'User not longer connect!',
      });
    }
    try {
      await this.refreshTokenService.remove(refreshData.id);

      return { code: 200, message: 'Disconnect token successfully!' };
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error', {
        cause: new Error(),
        description: 'Error appears while processing deconnection.',
      });
    }
  }

  /**
   * This function is responsible to add days in the actual one.
   * @param date
   * @returns  a future object date.
   */
  private addOneDay(date: Date): Date {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    return newDate;
  }
}
