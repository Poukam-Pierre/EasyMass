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

  async create(parishData: SignUpParishDto, adminId: string) {
    const { city, email, password, ...rest } = parishData;
    return this.prismaService.parish.create({
      data: {
        ...rest,
        city: {
          connect: {
            city_id: city.city_id,
          },
        },
        createdByAdmin: {
          connect: {
            adminId,
          },
        },
        user: {
          create: {
            email,
            password,
            role: 'PARISH',
          },
        },
      },
      include: { user: true },
    });
  }

  async findAll() {
    return this.prismaService.parish.findMany({
      select: {
        parishId: true,
        name: true,
        phone: true,
        managerName: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { email: true } },
      },
    });
  }

  async findParish(parishId: string) {
    return await this.prismaService.parish.findUnique({
      where: {
        parishId,
      },
    });
  }

  async findOneByMail(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
      include: { parish: true },
    });

    if (!user?.parish) return null;

    return {
      ...user.parish,
      email: user.email,
      password: user.password,
      userId: user.userId,
    };
  }

  async update(parishId: string, updateParishDto: Prisma.ParishUpdateInput) {
    return this.prismaService.parish.update({
      where: {
        parishId,
      },
      data: updateParishDto,
    });
  }

  async remove(parishId: string) {
    return this.prismaService.parish.delete({
      where: {
        parishId,
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
  async createParish(
    input: SignUpParishDto,
    request
  ): Promise<ParishDataDto | unknown> {
    const user = await this.credentialsParishValidation(input, request);

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
  async credentialsParishValidation(input: SignUpParishDto, request) {
    const { email, password } = input;
    try {
      const existing = await this.findOneByMail(email);

      if (existing) return null;

      const hash = await bcrypt.hash(password, 10);
      input.password = hash;

      const adminId = request.user.id;
      await this.create(input, adminId);

      return {
        statusCode: 200,
        message: 'Parish created successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error', {
        cause: new Error(),
        description:
          'Error appears while processing hash and create new user parish into db.',
      });
    }
  }

  async findAllMasses() {
    const parishWithItsOwnMasses = await this.prismaService.parish.findMany({
      select: {
        name: true,
        mass: {
          select: {
            price: true,
            processAt: true,
            massType: true,
          },
        },
      },
    });

    parishWithItsOwnMasses.forEach((parishData) => {
      parishData.mass.map((massData) => {
        massData['dateTime'] = new Date(massData.processAt);
        delete massData['processAt'];
      });
      parishData['massData'] = parishData.mass;
      delete parishData['mass'];
    });

    return parishWithItsOwnMasses;
  }
}
