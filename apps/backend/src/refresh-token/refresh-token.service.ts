import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RefreshTokenService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createRefreshTokenDto: Prisma.RefreshTokenCreateInput) {
    return this.prismaService.refreshToken.create({
      data: createRefreshTokenDto,
    });
  }

  async update(
    id: string,
    createRefreshTokenDto: Prisma.RefreshTokenUpdateInput
  ) {
    return this.prismaService.refreshToken.update({
      where: {
        id,
      },
      data: createRefreshTokenDto,
    });
  }

  async remove(id: string) {
    return this.prismaService.refreshToken.delete({
      where: {
        id,
      },
    });
  }

  async findOne(refreshToken: string) {
    return this.prismaService.refreshToken.findUnique({
      where: {
        refreshToken,
      },
    });
  }

  async findOneWithUser(refreshToken: string) {
    return this.prismaService.refreshToken.findUnique({
      where: { refreshToken },
      include: { user: true },
    });
  }

  /** Scoped session lookup — replaces the previous findAll()+.find() full
   * table scan used to enforce "one active session per user". */
  async findFirstByUser(userId: string) {
    return this.prismaService.refreshToken.findFirst({
      where: { userId },
    });
  }
}
