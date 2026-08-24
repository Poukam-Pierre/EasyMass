import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePriestDto } from './dto/create-priest.dto';
import { UpdatePriestDto } from './dto/update-priest.dto';

export interface PriestFilters {
  available?: boolean;
}

@Injectable()
export class PriestService {
  constructor(private readonly prismaService: PrismaService) {}

  /** Parish-managed roster entry — no User/login, per MVP scope. */
  async create(createPriestDto: CreatePriestDto, homeParishId: string) {
    return this.prismaService.priest.create({
      data: {
        ...createPriestDto,
        homeParish: { connect: { parishId: homeParishId } },
      },
    });
  }

  async findAllForParish(homeParishId: string, filters?: PriestFilters) {
    return this.prismaService.priest.findMany({
      where: { homeParishId, available: filters?.available },
    });
  }

  async findAll() {
    return this.prismaService.priest.findMany();
  }

  async findOne(priestId: string) {
    return this.prismaService.priest.findUnique({ where: { priestId } });
  }

  async update(
    priestId: string,
    updatePriestDto: UpdatePriestDto,
    requestUser: { id: string; role: string }
  ) {
    await this.assertOwnsPriest(priestId, requestUser);
    return this.prismaService.priest.update({
      where: { priestId },
      data: updatePriestDto,
    });
  }

  async remove(priestId: string, requestUser: { id: string; role: string }) {
    await this.assertOwnsPriest(priestId, requestUser);
    return this.prismaService.priest.delete({ where: { priestId } });
  }

  private async assertOwnsPriest(
    priestId: string,
    requestUser: { id: string; role: string }
  ) {
    if (requestUser.role === 'ADMIN') return;

    const priest = await this.prismaService.priest.findUnique({
      where: { priestId },
    });
    if (!priest) throw new NotFoundException('Priest not found');

    const parish = await this.prismaService.parish.findUnique({
      where: { userId: requestUser.id },
    });
    if (!parish || priest.homeParishId !== parish.parishId) {
      throw new ForbiddenException('Forbidden', {
        cause: new Error(),
        description: 'You may only manage priests on your own roster.',
      });
    }
  }
}
