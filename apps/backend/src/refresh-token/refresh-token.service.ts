import { Injectable, InternalServerErrorException } from '@nestjs/common';
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

  // TODO: set up JSDocs
  async remove(id: string) {
    try {
      await this.prismaService.refreshToken.delete({
        where: {
          id,
        },
      });

      return {
        statusCode: 201,
        message: 'refresh-token deleted successfully',
      };
    } catch (error) {
      console.log('Error while deleting refresh-token :', error);
      throw new InternalServerErrorException('serverError');
    }
  }

  async findOne(refreshToken: string) {
    return this.prismaService.refreshToken.findUnique({
      where: {
        refreshToken,
      },
    });
  }

  async findAll() {
    return this.prismaService.refreshToken.findMany();
  }

  // TODO: Add JSDocs here
  async findFirstToken({
    parishId,
    adminId,
  }: {
    parishId?: number;
    adminId?: number;
  }) {
    try {
      const refreshToken = await this.prismaService.refreshToken.findFirst({
        where: {
          ...(parishId && {
            parishId,
          }),
          ...(adminId && {
            adminId,
          }),
        },
      });

      return {
        statusCode: 200,
        refreshToken,
      };
    } catch (error) {
      console.log('Error while retreiving refresh-token :', error);
      throw new InternalServerErrorException('serverError');
    }
  }
}
