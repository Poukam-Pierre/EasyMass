import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateMassDto } from './dto/create-mass.dto';

@Injectable()
export class MassService {
  constructor(private readonly prismaService: PrismaService) {}

  async createMasses(input: CreateMassDto, request) {
    return;
  }

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
  private getDatesEvery7DaysUntilEndOfYear(startDate: Date): Date[] {
    const dates = [];
    const currentYear = new Date().getFullYear();
    const endDate = new Date(currentYear, 11, 31);

    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 7);
    }
    return dates;
  }
}
