import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MassOrderService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createMassOrderDto: Prisma.MassOrderCreateInput) {
    return this.prismaService.massOrder.create({
      data: createMassOrderDto,
    });
  }
}
