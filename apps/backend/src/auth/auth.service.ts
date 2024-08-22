import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { bcrypt } from 'bcryptjs';
import { ParishService } from '../parish/parish.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDataDto, ParishDataDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly JwtService: JwtService,
    private readonly parishService: ParishService,
    private readonly prismaService: PrismaService
  ) {}

  /**
   * This function authenticate the parish user when login
   * @param input
   * @returns
   */
  async authenticateParish(input: LoginDataDto): Promise<ParishDataDto> {
    const user = await this.validate(input, 'parish');

    if (!user) {
      throw new BadRequestException('Bad Request', {
        cause: new Error(),
        description: 'Wrong email or password.',
      });
    } else if (typeof user === 'string') {
      throw new ConflictException(user, {
        cause: new Error(),
        description: 'Account already logged in. Logout before login again.',
      });
    }

    return this.signIn(user);
  }

  /**
   * This function validate weither the user exists in db or not.
   * Alo check weither all user's credentials are valid or not.
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

    if (
      existingRefreshToken &&
      new Date() <= existingRefreshToken.expiredDate
    ) {
      return 'Already logged in';
    }

    try {
      const validatePassword = bcrypt.compare(password, user.password);
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
   *
   * @param user
   * @returns user informations
   */
  async signIn(user: ParishDataDto): Promise<ParishDataDto> {
    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    try {
      const accessToken = await this.JwtService.signAsync(tokenPayload);

      await this.prismaService.refreshToken.create({
        data: {
          id: createId(),
          refreshToken: refreshToken,
          expiredDate: this.addOneDay(new Date()),
          parishId: user.id,
        },
      });

      user.token = accessToken;
      return user;
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error', {
        cause: new Error(),
        description: 'Error appears while processing your request.',
      });
    }
  }

  private addOneDay(date: Date): Date {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    return newDate;
  }
}
