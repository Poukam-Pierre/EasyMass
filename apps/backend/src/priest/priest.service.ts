import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PriestService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    createPriestDto: Omit<Prisma.PriestCreateInput, 'user'>,
    email: string,
    password: string
  ) {
    return this.prismaService.priest.create({
      data: {
        ...createPriestDto,
        user: {
          create: {
            email,
            password,
            role: 'PRIEST',
          },
        },
      },
      include: { user: true },
    });
  }

  async findAll() {
    return this.prismaService.priest.findMany();
  }

  async findOne(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
      include: { priest: true },
    });

    if (!user?.priest) return null;

    return {
      ...user.priest,
      email: user.email,
      password: user.password,
      userId: user.userId,
    };
  }

  async findOneByAuthNumber(
    email: string,
    authNumber: string
  ): Promise<boolean> {
    const [existingUser, existingPriest] = await Promise.all([
      this.prismaService.user.findUnique({ where: { email } }),
      this.prismaService.priest.findUnique({ where: { authNumber } }),
    ]);

    return Boolean(existingUser || existingPriest);
  }

  async update(priestId: string, updatePriestDto: Prisma.PriestUpdateInput) {
    return this.prismaService.priest.update({
      where: {
        priestId,
      },
      data: updatePriestDto,
    });
  }

  async remove(priestId: string) {
    return this.prismaService.priest.delete({
      where: {
        priestId,
      },
    });
  }
}
