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
import { maskAnonymousOrders } from './anonymous-believer.util';
import { PaginatedResult, dateRangeFilter, toSkipTake } from '../common/pagination.utils';
import { DateRangeQueryDto } from '../common/dto/date-range-query.dto';

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
   * Paginated, optionally createdAt-range-filtered — masses belonging to
   * the authenticated parish whose start time hasn't passed yet, with
   * their mass orders. Parish-only route (@Roles), so no other caller
   * depends on this shape — safe to change in place, unlike
   * findMassOrderByMass below. The date filter and the "hasn't started
   * yet" cutoff both live in the MassOrder query itself now (via the
   * `mass` relation) rather than pre-fetching every mass and filtering in
   * JS, so this scales with the number of matching orders, not with the
   * parish's total mass history.
   */
  async findAllUnprocessMass(
    query: DateRangeQueryDto,
    requestUser: { id: string; role: UserRole }
  ): Promise<PaginatedResult<unknown> & { code: number; message: string }> {
    const parish = await resolveParishForUser(
      this.prismaService,
      requestUser.id
    );

    const { skip, take, page, limit } = toSkipTake(query.page, query.limit);
    const range = dateRangeFilter(query.from, query.to);
    const where: Prisma.MassOrderWhereInput = {
      mass: { parishId: parish.parishId, startAt: { gte: new Date() } },
      payments: { some: { status: 'COMPLETED' } },
      ...(range ? { createdAt: range } : {}),
    };

    try {
      const [data, total] = await Promise.all([
        this.prismaService.massOrder.findMany({
          where,
          include: { mass: true, orderByBeliever: true },
          orderBy: { createdAt: 'desc' },
          skip,
          take,
        }),
        this.prismaService.massOrder.count({ where }),
      ]);
      return {
        code: 200,
        data: maskAnonymousOrders(data),
        message: 'Successfull request',
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  private async assertCanViewMassOrders(
    massId: string,
    requestUser: { id: string; role: UserRole }
  ) {
    if (requestUser.role === UserRole.ADMIN) return;
    const mass = await this.massService.findOne(massId);
    if (!mass) throw new NotFoundException('Mass not found');
    const parish = await resolveParishForUser(
      this.prismaService,
      requestUser.id
    );
    if (parish.parishId !== mass.parishId) {
      throw new ForbiddenException('You may only view orders for your own masses.', {
        cause: new Error(),
      });
    }
  }

  /** Oldest to newest, per the intentions-gathering requirement — every
   * completed order for the mass, unbounded. Only called directly (not
   * through a route) by the printed/emailed intentions PDF, which needs
   * the whole list at once, not one page of it. Every HTTP caller uses
   * findPaginatedMassOrderByMass instead. */
  async findMassOrderByMass(
    massId: string,
    requestUser: { id: string; role: UserRole }
  ) {
    await this.assertCanViewMassOrders(massId, requestUser);

    // Scoped to orders with at least one COMPLETED payment — MassOrder
    // rows now exist from checkout initiation (see
    // PaymentService.handlePayment), not only once paid, so an intentions
    // list must not surface something nobody actually paid for.
    const orders = await this.prismaService.massOrder.findMany({
      where: {
        massId,
        payments: { some: { status: 'COMPLETED' } },
      },
      include: {
        orderByBeliever: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    return maskAnonymousOrders(orders);
  }

  /** Paginated + optional createdAt-range filter — backs every intentions
   * table in both admin-ui and parish. Kept separate from
   * findMassOrderByMass (rather than making pagination params optional on
   * one method) so that method's one remaining caller — PDF generation,
   * which needs the whole list — can't accidentally be handed a partial
   * page instead. */
  async findPaginatedMassOrderByMass(
    massId: string,
    query: DateRangeQueryDto,
    requestUser: { id: string; role: UserRole }
  ): Promise<PaginatedResult<unknown>> {
    await this.assertCanViewMassOrders(massId, requestUser);

    const { skip, take, page, limit } = toSkipTake(query.page, query.limit);
    const range = dateRangeFilter(query.from, query.to);
    const where: Prisma.MassOrderWhereInput = {
      massId,
      payments: { some: { status: 'COMPLETED' } },
      ...(range ? { createdAt: range } : {}),
    };

    const [data, total] = await Promise.all([
      this.prismaService.massOrder.findMany({
        where,
        include: { orderByBeliever: true },
        orderBy: { createdAt: 'asc' },
        skip,
        take,
      }),
      this.prismaService.massOrder.count({ where }),
    ]);
    return { data: maskAnonymousOrders(data), total, page, limit };
  }

  async findAll() {
    const orders = await this.prismaService.massOrder.findMany({
      include: {
        mass: true,
        orderByBeliever: true,
      },
    });
    return maskAnonymousOrders(orders);
  }
}
