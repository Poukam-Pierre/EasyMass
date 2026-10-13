import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { MassStatus, MassType, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { resolveParishForUser } from '../common/user.utils';
import { CreateMassDto, RecurrenceInterval } from './dto/create-mass.dto';
import { UpdateMassDto } from './dto/update-mass.dto';
import { maskAnonymousOrders } from '../mass-order/anonymous-believer.util';
import { PaginatedResult, toSkipTake } from '../common/pagination.utils';

export interface MassFilters {
  status?: MassStatus;
  massType?: MassType;
  from?: string;
  to?: string;
}

@Injectable()
export class MassService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates masses for the authenticated parish. If `recurrence` is given,
   * creates one mass per occurrence between startAt and recurrence.until,
   * at the same time-of-day (skipping any that already exist); otherwise
   * creates a single mass, rejecting an exact-timestamp duplicate.
   */
  async createMasses(
    input: CreateMassDto,
    requestUser: { id: string; role: UserRole }
  ): Promise<{ code: number; message: string }> {
    const parish = await resolveParishForUser(
      this.prismaService,
      requestUser.id
    );
    const parishId = parish.parishId;
    const { recurrence, startAt, estimatedDurationMinutes, price, massType } =
      input;

    const existingMass = await this.findAllByParish(parishId);

    if (recurrence) {
      const allDates = this.generateRecurrenceDates(
        startAt,
        recurrence.interval,
        recurrence.until
      );

      const uniqueDates = this.getUniqueDate(
        allDates,
        existingMass.map((mass) => mass.startAt.toISOString())
      );

      if (!uniqueDates.length)
        return { code: 200, message: 'All masses already exist!' };

      const listOfMasses = this.createListOfMasses(
        uniqueDates,
        input,
        parishId
      );

      try {
        await this.prismaService.$transaction(async (tx) => {
          await tx.mass.createMany({ data: listOfMasses });
          // createMany returns no rows, so the new masses have to be
          // looked back up by their (parishId, startAt) to seed each one's
          // MassPrice(XAF) — same purpose as the nested create below, just
          // done as a second step since createMany can't do nested writes.
          const created = await tx.mass.findMany({
            where: { parishId, startAt: { in: uniqueDates.map((d) => new Date(d)) } },
            select: { massId: true },
          });
          await tx.massPrice.createMany({
            data: created.map(({ massId }) => ({
              massId,
              currency: 'XAF' as const,
              amount: price,
              setByUserId: requestUser.id,
            })),
          });
        });
        return { code: 201, message: 'Mass created successfully!' };
      } catch (error) {
        throw new InternalServerErrorException();
      }
    }

    const isMassAlreadyExists = existingMass.some(
      (mass) => mass.startAt.getTime() === new Date(startAt).getTime()
    );

    if (isMassAlreadyExists) {
      throw new ConflictException('Mass already exists', {
        cause: new Error(),
        description: 'Mass already created by the same parish',
      });
    }

    const createInput: Prisma.MassCreateInput = {
      price,
      startAt: new Date(startAt),
      estimatedDurationMinutes,
      massType,
      parish: { connect: { parishId } },
      // Parishes set price in XAF (they're Cameroonian entities) — seed the
      // authoritative MassPrice(XAF) row at creation so resolvePrices()
      // resolves from MassPrice consistently, same as any other currency,
      // rather than only via the Mass.price fallback.
      massPrices: {
        create: {
          currency: 'XAF',
          amount: price,
          setByUser: { connect: { userId: requestUser.id } },
        },
      },
    };

    try {
      await this.create(createInput);
      return { code: 200, message: 'Mass created successfully!' };
    } catch (error) {
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
   * page/parish-detail tab/mass selector, and this service's own
   * createMasses "replicate" logic, which needs every existing date to
   * avoid creating duplicates, not just one page of them). New callers
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

  async markIntentionsSent(massId: string) {
    await this.prismaService.mass.update({
      where: { massId },
      data: { intentionsSentAt: new Date() },
    });
  }

  /** Every occurrence of the recurrence rule from startDate through the
   * inclusive `until` bound, at the same time-of-day as startDate. WEEKLY
   * steps by 7 days (so the weekday never drifts, by construction).
   * MONTHLY preserves the "Nth weekday of the month" position of startDate
   * (e.g. startDate on the 2nd Monday of January → every month's own 2nd
   * Monday) — a month with no such occurrence (e.g. no 5th Monday) is
   * skipped rather than snapped to the nearest one, matching how
   * Google/Outlook handle "monthly on the 5th weekday". */
  private generateRecurrenceDates(
    startDate: string,
    interval: RecurrenceInterval,
    until: string
  ): string[] {
    const start = new Date(startDate);
    const end = new Date(until);
    end.setHours(23, 59, 59, 999); // `until` is a date the parish picked, not a timestamp — make it inclusive of that whole day regardless of startAt's time-of-day.
    const dates: string[] = [];

    if (interval === RecurrenceInterval.WEEKLY) {
      const current = new Date(start);
      while (current <= end) {
        dates.push(new Date(current).toISOString());
        current.setDate(current.getDate() + 7);
      }
      return dates;
    }

    const weekday = start.getDay();
    const occurrence = Math.floor((start.getDate() - 1) / 7); // 0 = 1st, 1 = 2nd, ...

    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    while (cursor <= end) {
      const candidate = this.nthWeekdayOfMonth(
        cursor.getFullYear(),
        cursor.getMonth(),
        weekday,
        occurrence,
        start
      );
      if (candidate && candidate >= start && candidate <= end) {
        dates.push(candidate.toISOString());
      }
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return dates;
  }

  /** The `occurrence`-th (0-indexed) `weekday` of the given year/month, at
   * `timeSource`'s time-of-day — or null if that occurrence doesn't exist
   * in this month (e.g. a "5th Monday" in a month that only has 4). */
  private nthWeekdayOfMonth(
    year: number,
    month: number,
    weekday: number,
    occurrence: number,
    timeSource: Date
  ): Date | null {
    const firstOfMonth = new Date(year, month, 1);
    const firstMatchOffset = (weekday - firstOfMonth.getDay() + 7) % 7;
    const day = 1 + firstMatchOffset + occurrence * 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    if (day > daysInMonth) return null;
    return new Date(
      year,
      month,
      day,
      timeSource.getHours(),
      timeSource.getMinutes(),
      timeSource.getSeconds()
    );
  }

  private getUniqueDate(arrayDate1: string[], arrayDate2: string[]): string[] {
    const elementCount = new Map<string, number>();

    const newArrayDate2 = arrayDate2.filter(
      (date) => new Date(arrayDate1[0]) <= new Date(date)
    );

    arrayDate1.concat(newArrayDate2).forEach((date) => {
      elementCount.set(date, (elementCount.get(date) || 0) + 1);
    });

    return Array.from(elementCount.entries())
      .filter(([, count]) => count === 1)
      .map(([date]) => date);
  }

  private createListOfMasses(
    arrayDate: string[],
    input: CreateMassDto,
    parishId: string
  ): Prisma.MassCreateManyInput[] {
    return arrayDate.map((date) => ({
      price: input.price,
      startAt: new Date(date),
      estimatedDurationMinutes: input.estimatedDurationMinutes,
      massType: input.massType,
      parishId,
    }));
  }
}
