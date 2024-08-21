import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { bcrypt } from 'bcryptjs';
import { ParishService } from '../parish/parish.service';
import { LoginDataDto, ParishDataDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly JwtService: JwtService,
    private readonly parishService: ParishService
  ) {}

  async authenticate(input: LoginDataDto): Promise<ParishDataDto> {
    const user = await this.validate(input);

    if (!user) {
      throw new BadRequestException('Bad Request', {
        cause: new Error(),
        description: 'Wrong email or password.',
      });
    } else if (typeof user === 'string') {
      throw new ConflictException(user, {
        cause: new Error(),
        description:
          'Your account is already in use! Please logout before logging again.',
      });
    }

    return this.signIn(user);
  }

  async validate(input: LoginDataDto): Promise<ParishDataDto | null | string> {
    const { email, password } = input;
    const user = await this.parishService.findOneByMail(email);

    if (!user) {
      return null;
    } else if (user.token) {
      const verifyToken = await this.tokenCheckValidity(user.token, user.id);
      if (typeof verifyToken === 'string') {
        return verifyToken;
      }
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

      await this.parishService.update(user.id, { token: accessToken });

      user.token = accessToken;
      return user;
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error', {
        cause: new Error(),
        description: 'Error appears while processing your request.',
      });
    }
  }

  /**
   *
   * @param token
   * @param id
   * @returns a string if token is valide or @null if token is not.
   */
  async tokenCheckValidity(token: string, id: number): Promise<string | null> {
    try {
      const verifyToken = await this.JwtService.verifyAsync(token);

      if (!verifyToken) {
        await this.parishService.update(id, { token: null });
        return null;
      }

      return 'already logged in';
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error', {
        cause: new Error(),
        description: 'Error appears while processing your request.',
      });
    }
  }
}
