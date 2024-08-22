import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdministratorService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createAdminDto: Prisma.AdministratorCreateInput) {
    return this.prismaService.administrator.create({
      data: createAdminDto,
    });
  }

  async findAll() {
    return this.prismaService.administrator.findMany();
  }

  async findOne(id: number) {
    return this.prismaService.administrator.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: number, updateAdminDto: Prisma.AdministratorUpdateInput) {
    return this.prismaService.administrator.update({
      where: {
        id,
      },
      data: updateAdminDto,
    });
  }

  async remove(id: number) {
    return this.prismaService.administrator.delete({
      where: {
        id,
      },
    });
  }
}
