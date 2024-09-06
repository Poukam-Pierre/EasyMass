import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { SignUpParishDto } from './dto/signupParish.dto';
import { ParishDataDto } from './dto/parishData.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ParishService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createParishDto: Prisma.ParishCreateInput) {
    return this.prismaService.parish.create({
      data: createParishDto,
    });
  }

  async findAll() {
    return this.prismaService.parish.findMany();
  }

  async findOne(id: number) {
    return this.prismaService.parish.findUnique({
      where: {
        id,
      },
    });
  }

  async findOneByMail(email: string) {
    return this.prismaService.parish.findUnique({
      where: {
        email,
      },
    });
  }

  async update(id: number, updateParishDto: Prisma.ParishUpdateInput) {
    return this.prismaService.parish.update({
      where: {
        id,
      },
      data: updateParishDto,
    });
  }

  async remove(id: number) {
    return this.prismaService.parish.delete({
      where: {
        id,
      },
    });
  }

  /**
   * This function passes the input and request to other validation function
   * and just waits for the result to perfom error action. If any error occurs
   * the function passes the result to signIn function and returns the result.
   * @param input receiving value from client side
   * @param request request object processed in the guard function
   * @returns successfull result object
   */
  async signupParish(
    input: SignUpParishDto,
    request
  ): Promise<ParishDataDto | unknown> {
    const user = await this.signUpParishValidation(input, request);

    if (!user) {
      throw new BadRequestException('Bad Request', {
        cause: new Error(),
        description: 'This account is already in use.',
      });
    }

    return { code: 200, message: 'New parish created successfully' };
  }

  /**
   * This function verifies that the input from the client exists in the database. If so,
   * the function returns null. Otherwise, the function hash password and creates a new
   * user account. Then returns the user object created.
   * @param input
   * @param request
   * @returns
   */
  async signUpParishValidation(
    input: SignUpParishDto,
    request
  ): Promise<ParishDataDto> {
    const { email, password } = input;
    const user = await this.findOneByMail(email);

    if (user) return null;

    try {
      const hash = await bcrypt.hash(password, 10);
      input.password = hash;

      input.createdByAdmin = {
        connect: {
          id: request.user.id,
        },
      };
      const newUser = await this.create(input);
      delete newUser.password;
      delete newUser.updatedAt;

      return newUser;
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error', {
        cause: new Error(),
        description:
          'Error appears while processing hash and create new user parish into db.',
      });
    }
  }
}
