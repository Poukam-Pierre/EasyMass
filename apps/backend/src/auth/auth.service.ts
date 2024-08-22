import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createId } from '@paralleldrive/cuid2';
import { bcrypt } from 'bcryptjs';
import { ParishService } from '../parish/parish.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  AdminDataDto,
  LoginDataDto,
  ParishDataDto,
  PriestDataDto,
} from './dto/login.dto';
import { AdministratorService } from '../administrator/administrator.service';
import { Prisma } from '@prisma/client';
import { SignUpDataDto } from './dto/signup.dto';
import { PriestService } from '../priest/priest.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly JwtService: JwtService,
    private readonly parishService: ParishService,
    private readonly prismaService: PrismaService,
    private readonly adminService: AdministratorService,
    private readonly priestService: PriestService
  ) {}

  /**
   * This function authenticate the users when login
   * @param input
   * @returns all data needed.
   */
  async authenticate(
    input: LoginDataDto,
    role: string
  ): Promise<ParishDataDto | AdminDataDto | PriestDataDto> {
    if (role === 'parish') {
      const user = await this.validateParish(input);

      if (!user) {
        throw new BadRequestException('Bad Request', {
          cause: new Error(),
          description: 'Wrong email or password.',
        });
      } else if (typeof user === 'string') {
        throw new ConflictException('Conflict', {
          cause: new Error(),
          description: 'Account already logged in. Logout before login again.',
        });
      }

      return this.signIn(user, role);
    } else if (role === 'admin') {
      const user = await this.validateAdmin(input);

      if (!user) {
        throw new BadRequestException('Bad Request', {
          cause: new Error(),
          description: 'Wrong email or password.',
        });
      } else if (typeof user === 'string') {
        throw new ConflictException('Conflict', {
          cause: new Error(),
          description: 'Account already logged in. Logout before login again.',
        });
      }

      return this.signIn(user, role);
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
      await this.prismaService.refreshToken.findMany()
    ).find((token) => token.parishId === user.id);

    if (existingRefreshToken) {
      if (new Date() <= existingRefreshToken.expiredDate) {
        return 'Already logged in';
      } else {
        await this.prismaService.refreshToken.delete({
          where: {
            refreshToken: existingRefreshToken.refreshToken,
          },
        });
      }
    }

    try {
      const validatePassword = await bcrypt.compare(password, user.password);
      if (validatePassword) {
        return {
          id: user.id,
          email: user.email,
          city: user.city,
          diocese: user.diocese,
          leadManager: user.leadManager,
          name: user.name,
          phone: user.phone,
          region: user.region,
          createdAt: user.createdAt,
        };
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
      await this.prismaService.refreshToken.findMany()
    ).find((token) => token.parishId === user.id);

    if (existingRefreshToken) {
      if (new Date() <= existingRefreshToken.expiredDate) {
        return 'Already logged in';
      } else {
        await this.prismaService.refreshToken.delete({
          where: {
            refreshToken: existingRefreshToken.refreshToken,
          },
        });
      }
    }

    try {
      const validatePassword = await bcrypt.compare(password, user.password);
      if (validatePassword) {
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt,
        };
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
   * @param user
   * @returns user object
   */
  async signIn(
    user: ParishDataDto | AdminDataDto | PriestDataDto,
    role: string
  ): Promise<ParishDataDto | AdminDataDto | PriestDataDto> {
    const tokenPayload = {
      id: user.id,
      email: user.email,
    };

    try {
      const accessToken = await this.JwtService.signAsync(tokenPayload);
      const refreshToken = createId();

      if (role === 'parish') {
        await this.create({
          id: createId(),
          refreshToken: refreshToken,
          expiredDate: this.addOneDay(new Date()),
          parishToken: {
            connect: {
              id: user.id,
            },
          },
        });
      } else if (role === 'admin') {
        await this.create({
          id: createId(),
          refreshToken: refreshToken,
          expiredDate: this.addOneDay(new Date()),
          adminToken: {
            connect: {
              id: user.id,
            },
          },
        });
      } else {
        await this.create({
          id: createId(),
          refreshToken: refreshToken,
          expiredDate: this.addOneDay(new Date()),
          priestToken: {
            connect: {
              id: user.id,
            },
          },
        });
      }

      user.accessToken = accessToken;
      user.refreshToken = refreshToken;
      return user;
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error', {
        cause: new Error(),
        description: 'Error appears while processing your request.',
      });
    }
  }

  async signup(input: SignUpDataDto): Promise<PriestDataDto | unknown> {
    const user = await this.signUpValidation(input);

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
        description: 'Error appears while processing your request.',
      });
    }
  }

  async signUpValidation(input: SignUpDataDto): Promise<PriestDataDto | null> {
    const { email } = input;

    const user = await this.priestService.findOne(email); // TODO Adjust the function to find element user using two params like email and authNumber
    if (user) return null;

    try {
      const hash = await bcrypt.hash(user.password, 10);
      user.password = hash;

      await this.priestService.create(user);

      return user;
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error', {
        cause: new Error(),
        description: 'Error appears while processing your request.',
      });
    }
  }

  private async create(createRefreshTokenDto: Prisma.RefreshTokenCreateInput) {
    return this.prismaService.refreshToken.create({
      data: createRefreshTokenDto,
    });
  }

  private addOneDay(date: Date): Date {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    return newDate;
  }
}
