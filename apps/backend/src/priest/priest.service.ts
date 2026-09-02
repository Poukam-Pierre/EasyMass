import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { resolveParishForUser } from '../common/user.utils';
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

  /** Scoped to the calling parish's own roster unless the caller is an
   * admin — a priest belongs to exactly one parish, and its details
   * (birthDate, phoneNumber, authCardImage) shouldn't be readable by other
   * parishes. */
  async findOne(
    priestId: string,
    requestUser: { id: string; role: UserRole }
  ) {
    const priest = await this.prismaService.priest.findUnique({
      where: { priestId },
    });
    if (!priest) throw new NotFoundException('Priest not found');

    await this.assertOwnsPriest(priest, requestUser);
    return priest;
  }

  async update(
    priestId: string,
    updatePriestDto: UpdatePriestDto,
    requestUser: { id: string; role: UserRole }
  ) {
    const priest = await this.prismaService.priest.findUnique({
      where: { priestId },
    });
    if (!priest) throw new NotFoundException('Priest not found');
    await this.assertOwnsPriest(priest, requestUser);

    return this.prismaService.priest.update({
      where: { priestId },
      data: updatePriestDto,
    });
  }

  async remove(priestId: string, requestUser: { id: string; role: UserRole }) {
    const priest = await this.prismaService.priest.findUnique({
      where: { priestId },
    });
    if (!priest) throw new NotFoundException('Priest not found');
    await this.assertOwnsPriest(priest, requestUser);

    return this.prismaService.priest.delete({ where: { priestId } });
  }

  private async assertOwnsPriest(
    priest: { homeParishId: string | null },
    requestUser: { id: string; role: UserRole }
  ) {
    if (requestUser.role === UserRole.ADMIN) return;

    // Throws ForbiddenException if the caller isn't a parish at all —
    // same helper and error semantics used everywhere else in the app,
    // instead of a bespoke lookup with its own (looser) failure behavior.
    const parish = await resolveParishForUser(
      this.prismaService,
      requestUser.id
    );
    if (priest.homeParishId !== parish.parishId) {
      throw new ForbiddenException('Forbidden', {
        cause: new Error(),
        description: 'You may only manage priests on your own roster.',
      });
    }
  }
}
