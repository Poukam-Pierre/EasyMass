import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdministratorService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    createAdminDto: Omit<Prisma.AdministratorCreateInput, 'user'>,
    email: string,
    password: string
  ) {
    return this.prismaService.administrator.create({
      data: {
        ...createAdminDto,
        user: {
          create: {
            email,
            password,
            role: 'ADMIN',
          },
        },
      },
      include: { user: true },
    });
  }

  async findAll() {
    return this.prismaService.administrator.findMany();
  }

  async findOne(adminId: string) {
    return this.prismaService.administrator.findUnique({
      where: {
        adminId,
      },
    });
  }

  async findOneByMail(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
      include: { admin: true },
    });

    if (!user?.admin) return null;

    return {
      ...user.admin,
      email: user.email,
      password: user.password,
      userId: user.userId,
    };
  }

  async update(
    adminId: string,
    updateAdminDto: Prisma.AdministratorUpdateInput
  ) {
    return this.prismaService.administrator.update({
      where: {
        adminId,
      },
      data: updateAdminDto,
    });
  }

  async remove(adminId: string) {
    return this.prismaService.administrator.delete({
      where: {
        adminId,
      },
    });
  }
}
