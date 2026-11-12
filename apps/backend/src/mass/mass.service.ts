import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { MassStatus, MassType, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { resolveParishForUser } from '../common/user.utils';
import { CreateMassDto } from './dto/create-mass.dto';
import { UpdateMassDto } from './dto/update-mass.dto';
import { maskAnonymousOrders } from '../mass-order/anonymous-believer.util';
import { PaginatedResult, toSkipTake } from '../common/pagination.utils';
import { DISPLAY_TIME_ZONE } from '../common/constants';
import { generateRecurrenceDates } from './recurrence.util';

export interface MassFilters {
  status?: MassStatus;
  massType?: MassType;
  from?: string;
  to?: string;
}

export interface MassCreationResult {
  code: number;
  message: string;
  /** Masses actually created. */
  created: number;
  /** Requested dates the parish already had a mass at. */
  skipped: number;
}

@Injectable()
export class MassService {
  private readonly logger = new Logger(MassService.name);

  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates masses for the authenticated parish. Without `recurrence`,
   * creates the one mass and rejects an exact-timestamp duplicate. With it,
   * creates `recurrence.count` masses (see generateRecurrenceDates),
   * skipping any date the parish already has a mass at — so a second
   * series, or one overlapping single masses, only adds what's missing.
   */
  async createMasses(
    input: CreateMassDto,
    requestUser: { id: string; role: UserRole }
  ): Promise<MassCreationResult> {
    const parish = await resolveParishForUser(
      this.prismaService,
      requestUser.id
    );
    const parishId = parish.parishId;
    // Whole seconds: the duplicate check compares exact timestamps, so a
    // stray millisecond from the client must not make a duplicate look new.
    const startAt = new Date(input.startAt);
    startAt.setUTCMilliseconds(0);

    if (!input.recurrence) {
      const exists = await this.prismaService.mass.findFirst({
        where: { parishId, startAt },
        select: { massId: true },
      });
      if (exists) {
        throw new ConflictException('Mass already exists', {
          cause: new Error(),
          description: 'Mass already created by the same parish',
        });
      }
    }

    const dates = input.recurrence
      ? generateRecurrenceDates(
          startAt,
          input.recurrence.interval,
          input.recurrence.count,
          DISPLAY_TIME_ZONE
        )
      : [startAt];

    try {
      const created = await this.prismaService.$transaction(async (tx) => {
        // Mass has no (parishId, startAt) unique constraint, so the
        // check-then-insert below is only safe if one parish's creations
        // run one at a time: a double-clicked Save or two open tabs would
        // otherwise both see no existing rows and insert the same dates.
        // Transaction-scoped, so it's released on commit or rollback.
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('mass-create'), hashtext(${parishId}))`;
        const existing = await tx.mass.findMany({
          where: { parishId, startAt: { in: dates } },
          select: { startAt: true },
        });
        const taken = new Set(existing.map((mass) => mass.startAt.getTime()));
        const newDates = dates.filter((date) => !taken.has(date.getTime()));
        if (!newDates.length) return 0;

        const masses = await tx.mass.createManyAndReturn({
          data: newDates.map((date) => ({
            price: input.price,
            startAt: date,
            estimatedDurationMinutes: input.estimatedDurationMinutes,
            massType: input.massType,
            parishId,
          })),
          select: { massId: true },
        });
        // Parishes set prices in XAF — seed each new mass's authoritative
        // MassPrice(XAF) row now, so resolvePrices() always resolves from
        // MassPrice rather than only via the Mass.price fallback. Only the
        // masses just created, never ones that already had a price.
        await tx.massPrice.createMany({
          data: masses.map(({ massId }) => ({
            massId,
            currency: 'XAF' as const,
            amount: input.price,
            setByUserId: requestUser.id,
          })),
        });
        return masses.length;
      });

      const skipped = dates.length - created;
      return created
        ? { code: 201, message: 'Mass created successfully!', created, skipped }
        : { code: 200, message: 'All masses already exist!', created, skipped };
    } catch (error) {
      this.logger.error(
        `Creating ${dates.length} mass(es) for parish ${parishId} failed`,
        error instanceof Error ? error.stack : String(error)
      );
      throw new InternalServerErrorException();
    }
  }

  async create(createMassDto: Prisma.MassCreateInput) {
    return this.prismaService.mass.create({
      data: createMassDto,
    });
  }

  /** Once a mass is no longer OPEN, none of its fields are editable — the
   * ordering window has closed and/or intentions may already have been
   * gathered into a PDF and emailed, so schedule, intention, and priest
   * assignment must all stay frozen to match what was sent. */
  async update(
    massId: string,
    updateMassDto: UpdateMassDto,
    requestUser: { id: string; role: UserRole }
  ) {
    const [mass, parish] = await Promise.all([
      this.prismaService.mass.findUnique({ where: { massId } }),
      requestUser.role === UserRole.ADMIN
        ? null
        : resolveParishForUser(this.prismaService, requestUser.id),
    ]);
    if (!mass) {
      throw new ConflictException('Mass not found');
    }

    if (parish && parish.parishId !== mass.parishId) {
      throw new ForbiddenException('You may only manage your own masses.', {
        cause: new Error(),
      });
    }

    const changesAnyLockedField = Object.keys(updateMassDto).length > 0;
    if (changesAnyLockedField && mass.status !== 'OPEN') {
      throw new ConflictException(
        'This mass can no longer be edited — ordering has closed.',
        { cause: new Error() }
      );
    }

    return this.prismaService.$transaction(async (tx) => {
      const updated = await tx.mass.update({
        where: { massId },
        data: {
          ...updateMassDto,
          startAt: updateMassDto.startAt
            ? new Date(updateMassDto.startAt)
            : undefined,
        },
      });

      // Keep MassPrice(XAF) in sync with Mass.price — resolvePrices()
      // always prefers a MassPrice row over Mass.price once one exists, so
      // without this an edited price would silently stop taking effect at
      // checkout (the stale MassPrice(XAF) row would keep winning).
      if (updateMassDto.price !== undefined) {
        await tx.massPrice.upsert({
          where: { massId_currency: { massId, currency: 'XAF' } },
          create: {
            massId,
            currency: 'XAF',
            amount: updateMassDto.price,
            setByUserId: requestUser.id,
          },
          update: {
            amount: updateMassDto.price,
            setByUserId: requestUser.id,
          },
        });
      }

      return updated;
    });
  }

  /** Used by payment confirmation to fetch every mass in a checkout in one
   * round trip instead of one findOne per mass. */
  async findManyByIds(massIds: string[]) {
    return this.prismaService.mass.findMany({
      where: { massId: { in: massIds } },
    });
  }

  private buildParishMassWhere(
    parishId: string,
    filters?: MassFilters
  ): Prisma.MassWhereInput {
    return {
      parishId,
      status: filters?.status,
      massType: filters?.massType,
      startAt:
        filters?.from || filters?.to
          ? {
              gte: filters?.from ? new Date(filters.from) : undefined,
              lte: filters?.to ? new Date(filters.to) : undefined,
            }
          : undefined,
    };
  }

  private static readonly MASS_ROW_SELECT = {
    massId: true,
    price: true,
    startAt: true,
    estimatedDurationMinutes: true,
    status: true,
    createdAt: true,
    massType: true,
  } as const;

  /** Unbounded — kept exactly as-is for existing callers (admin-ui's masses
   * page/parish-detail tab/mass selector). New callers
   * that need pagination/filtering should use findAllByParishPaginated. */
  async findAllByParish(parishId: string, filters?: MassFilters) {
    return this.prismaService.mass.findMany({
      where: this.buildParishMassWhere(parishId, filters),
      select: MassService.MASS_ROW_SELECT,
      orderBy: { startAt: 'asc' },
    });
  }

  /** Paginated counterpart to findAllByParish, sharing the same filters —
   * additive, so the unbounded method/route above keeps its existing
   * contract for callers that rely on it. */
  async findAllByParishPaginated(
    parishId: string,
    filters: MassFilters & { page?: number | string; limit?: number | string }
  ): Promise<PaginatedResult<unknown>> {
    const { skip, take, page, limit } = toSkipTake(filters.page, filters.limit);
    const where = this.buildParishMassWhere(parishId, filters);

    const [data, total] = await Promise.all([
      this.prismaService.mass.findMany({
        where,
        select: MassService.MASS_ROW_SELECT,
        orderBy: { startAt: 'asc' },
        skip,
        take,
      }),
      this.prismaService.mass.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  /** massOrder is scoped to orders with at least one COMPLETED payment —
   * MassOrder rows now exist from the moment checkout is initiated (see
   * PaymentService.handlePayment), not only once paid, so an abandoned or
   * failed checkout must not be counted as a real order here. */
  async findAll(parishId: string) {
    return this.prismaService.mass.findMany({
      where: {
        parishId,
      },
      include: {
        massOrder: {
          where: { payments: { some: { status: 'COMPLETED' } } },
        },
      },
    });
  }

  async findOne(massId: string) {
    return this.prismaService.mass.findUnique({
      where: {
        massId,
      },
    });
  }

  async remove(massId: string) {
    return this.prismaService.mass.delete({
      where: {
        massId,
      },
    });
  }

  private static readonly ORDERING_CUTOFF_MINUTES = 30;

  /** The Mass status state machine: OPEN -> CLOSED -> PROCESSING ->
   * COMPLETED. Owned here (not by the scheduler) so every direct write to
   * Mass.status lives in one place. Called once a minute by
   * MassSchedulerService, which only owns the cron trigger and the
   * PDF/email side effect (sendPendingIntentions). */
  async sweepStatusTransitions() {
    await this.closeOrdering();
    await this.startProcessing();
    await this.completeProcessing();
  }

  /** OPEN -> CLOSED once 30 minutes before startAt — a hard business
   * deadline, applied regardless of whether the intentions email succeeds. */
  private async closeOrdering() {
    const cutoff = new Date(
      Date.now() + MassService.ORDERING_CUTOFF_MINUTES * 60 * 1000
    );
    await this.prismaService.mass.updateMany({
      where: { status: 'OPEN', startAt: { lte: cutoff } },
      data: { status: 'CLOSED' },
    });
  }

  private async startProcessing() {
    await this.prismaService.mass.updateMany({
      where: { status: 'CLOSED', startAt: { lte: new Date() } },
      data: { status: 'PROCESSING' },
    });
  }

  /** startAt + estimatedDurationMinutes varies per row, so this can't be a
   * single conditional updateMany — fetch PROCESSING masses and filter in
   * JS (cheap at this scale: only currently-processing masses). */
  private async completeProcessing() {
    const processing = await this.prismaService.mass.findMany({
      where: { status: 'PROCESSING' },
      select: { massId: true, startAt: true, estimatedDurationMinutes: true },
    });

    const now = Date.now();
    const doneIds = processing
      .filter(
        (m) =>
          m.startAt.getTime() + m.estimatedDurationMinutes * 60 * 1000 <= now
      )
      .map((m) => m.massId);

    if (doneIds.length === 0) return;

    await this.prismaService.mass.updateMany({
      where: { massId: { in: doneIds } },
      data: { status: 'COMPLETED' },
    });
  }

  /** Masses ready for the intentions PDF/email but not yet sent —
   * independent of status transitions so a mail failure can be retried
   * every tick without blocking the ordering-cutoff deadline. */
  async findPendingIntentions() {
    const masses = await this.prismaService.mass.findMany({
      where: {
        status: { in: ['CLOSED', 'PROCESSING', 'COMPLETED'] },
        intentionsSentAt: null,
      },
      include: {
        parish: { include: { user: true } },
        // Scoped to COMPLETED payments — MassOrder rows now exist from
        // checkout initiation (see PaymentService.handlePayment), not only
        // once paid, so an abandoned/failed checkout must never end up in
        // the PDF/email actually sent to the parish.
        massOrder: {
          where: { payments: { some: { status: 'COMPLETED' } } },
          include: { orderByBeliever: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    return masses.map((mass) => ({
      ...mass,
      massOrder: maskAnonymousOrders(mass.massOrder),
    }));
  }

  /** Marks a mass's intentions as sent, unless an order the sent PDF
   * didn't list has a COMPLETED payment by now (a checkout that settled
   * while the PDF was being built or emailed). Then the mass stays pending
   * and the next sweep re-sends the full list.
   *
   * Comparing order ids rather than timestamps doesn't depend on when the
   * settling transaction commits. The row lock waits for any settle that
   * already touched this mass (PaymentService.finalizeCheckout always
   * writes the mass row) to commit, so the check that follows, a fresh
   * READ COMMITTED snapshot, sees its payments. */
  async markIntentionsSent(
    massId: string,
    sentAt: Date,
    sentOrderIds: string[]
  ) {
    await this.prismaService.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT 1 FROM "mass" WHERE "massId" = ${massId} FOR UPDATE`;
      await tx.mass.updateMany({
        where: {
          massId,
          massOrder: {
            none: {
              massOrderId: { notIn: sentOrderIds },
              payments: { some: { status: 'COMPLETED' } },
            },
          },
        },
        data: { intentionsSentAt: sentAt },
      });
    });
  }
}
