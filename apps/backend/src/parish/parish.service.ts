import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

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
}
