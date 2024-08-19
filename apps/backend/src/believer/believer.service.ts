import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class BelieverService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createBelieverDto: Prisma.BelieverCreateInput) {
    return this.prismaService.believer.create({
      data: createBelieverDto,
    });
  }
}
