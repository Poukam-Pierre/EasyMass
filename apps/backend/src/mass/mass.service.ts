import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MassService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createMassDto: Prisma.MassCreateInput) {
    return this.prismaService.mass.create({
      data: createMassDto,
    });
  }

  async update(id: number, updateMassDto: Prisma.MassUpdateInput) {
    return this.prismaService.mass.update({
      where: { id },
      data: updateMassDto,
    });
  }

  async findAll(parishId?: number, believerId?: string) {
    return this.prismaService.mass.findMany({
      where: {
        OR: [{ parishId }, { believerId }],
      },
    });
  }

  async findOne(id: number) {
    return this.prismaService.mass.findUnique({
      where: {
        id,
      },
    });
  }

  async remove(id: number) {
    return this.prismaService.mass.delete({
      where: {
        id,
      },
    });
  }
}
