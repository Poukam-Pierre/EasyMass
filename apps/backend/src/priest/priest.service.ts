import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PriestService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createPriestDto: Prisma.PriestCreateInput) {
    return this.prismaService.priest.create({
      data: createPriestDto,
    });
  }

  async findAll() {
    return this.prismaService.priest.findMany();
  }

  async findOne(email: string) {
    return this.prismaService.priest.findUnique({
      where: {
        email,
      },
    });
  }

  async findOneByAuthNumber(email: string, authNumber: string) {
    return this.prismaService.priest.findMany({
      where: {
        OR: [{ email: email }, { authNumber: authNumber }],
      },
    });
  }

  async update(id: number, updatePriestDto: Prisma.PriestUpdateInput) {
    return this.prismaService.priest.update({
      where: {
        id,
      },
      data: updatePriestDto,
    });
  }

  async remove(id: number) {
    return this.prismaService.priest.delete({
      where: {
        id,
      },
    });
  }
}
