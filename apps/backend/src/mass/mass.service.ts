import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { MassStatus, MassType, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { resolveParishForUser } from '../common/user.utils';
import { CreateMassDto } from './dto/create-mass.dto';
import { UpdateMassDto } from './dto/update-mass.dto';
import { maskAnonymousOrders } from '../mass-order/anonymous-believer.util';

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
   * Creates masses for the authenticated parish. If replicate=true, creates
   * one mass every 7 days at the same time-of-day from startAt until the end
   * of the current year (skipping any that already exist); otherwise creates
   * a single mass, rejecting an exact-timestamp duplicate.
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
    const { replicate, startAt, estimatedDurationMinutes, price, massType } =
      input;

    const existingMass = await this.findAllByParish(parishId);

    if (replicate) {
      const allDates = this.getDatesEvery7DaysUntilEndOfYear(startAt);

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

  async findAllByParish(parishId: string, filters?: MassFilters) {
    return this.prismaService.mass.findMany({
      where: {
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
      },
      select: {
        massId: true,
        price: true,
        startAt: true,
        estimatedDurationMinutes: true,
        status: true,
        createdAt: true,
        massType: true,
      },
      orderBy: { startAt: 'asc' },
    });
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

  private getDatesEvery7DaysUntilEndOfYear(startDate: string): string[] {
    const dates: string[] = [];
    const currentYear = new Date().getFullYear();
    const endDate = new Date(currentYear, 11, 31);

    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate).toISOString());
      currentDate.setDate(currentDate.getDate() + 7);
    }
    return dates;
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
