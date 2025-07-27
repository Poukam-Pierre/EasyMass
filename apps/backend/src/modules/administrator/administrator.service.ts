import {
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdministratorService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createAdminDto: Prisma.AdministratorCreateInput) {
    return this.prismaService.administrator.create({
      data: createAdminDto
    });
  }

  async findAll() {
    return this.prismaService.administrator.findMany();
  }

  async findOne(request: any) {
    const { id } = request.user;
    if (!id) {
      throw new NotFoundException('NotFountUser');
    }
    try {
      const administrator = await this.prismaService.administrator.findUnique({
        where: {
          id
        },
        select: {
          email: true,
          name: true
        }
      });
      if (!administrator) throw new NotFoundException('NotFountUser');

      return {
        statusCode: 200,
        user: administrator
      };
    } catch (error) {
      console.error('Error finding administrator:', error);
      if (error instanceof NotFoundException) {
        throw new NotFoundException('NotFountUser');
      }
      throw new InternalServerErrorException('serverError');
    }
  }

  async findOneByMail(email: string) {
    return this.prismaService.administrator.findUnique({
      where: {
        email
      }
    });
  }

  async update(id: number, updateAdminDto: Prisma.AdministratorUpdateInput) {
    return this.prismaService.administrator.update({
      where: {
        id
      },
      data: updateAdminDto
    });
  }

  async remove(id: number) {
    return this.prismaService.administrator.delete({
      where: {
        id
      }
    });
  }
}
