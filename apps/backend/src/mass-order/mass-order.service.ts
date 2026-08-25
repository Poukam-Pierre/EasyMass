import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, UserRole } from '@prisma/client';
import { MassService } from '../mass/mass.service';
import { resolveParishForUser } from '../common/user.utils';

@Injectable()
export class MassOrderService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly massService: MassService
  ) {}

  async create(createMassOrderDto: Prisma.MassOrderCreateInput) {
    return this.prismaService.massOrder.create({
      data: createMassOrderDto,
    });
  }

  /**
   * Masses belonging to the authenticated parish whose start time hasn't
   * passed yet and that have at least one order, with their mass orders.
   */
  async findAllUnprocessMass(requestUser: { id: string; role: UserRole }) {
    const parish = await resolveParishForUser(
      this.prismaService,
      requestUser.id
    );

    try {
      const masses = await this.massService.findAll(parish.parishId);
      const allUnprocessMass = masses.filter(
        (mass) => mass.startAt >= new Date() && mass.massOrder.length !== 0
      );

      const massIds = allUnprocessMass.map((mass) => mass.massId);

      const allUnprocessMasses = await this.prismaService.massOrder.findMany({
        where: {
          massId: {
            in: massIds,
          },
        },
        include: {
          mass: true,
          orderByBeliever: true,
        },
      });
      return {
        code: 200,
        data: allUnprocessMasses,
        message: 'Successfull request',
      };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  /** Oldest to newest, per the intentions-gathering requirement. Scoped to
   * the calling parish unless the caller is an admin. */
  async findMassOrderByMass(
    massId: string,
    requestUser: { id: string; role: UserRole }
  ) {
    if (requestUser.role !== UserRole.ADMIN) {
      const mass = await this.massService.findOne(massId);
      if (!mass) throw new NotFoundException('Mass not found');
      const parish = await resolveParishForUser(
        this.prismaService,
        requestUser.id
      );
      if (parish.parishId !== mass.parishId) {
        throw new ForbiddenException('Forbidden', {
          cause: new Error(),
          description: 'You may only view orders for your own masses.',
        });
      }
    }

    return this.prismaService.massOrder.findMany({
      where: {
        massId,
      },
      include: {
        orderByBeliever: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findAll() {
    return this.prismaService.massOrder.findMany({
      include: {
        mass: true,
        orderByBeliever: true,
      },
    });
  }
}
