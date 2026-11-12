import {
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { MassType, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMassDto, RecurrenceInterval } from './dto/create-mass.dto';
import { MassService } from './mass.service';

describe('MassService.createMasses', () => {
  const parishUser = { id: 'user-1', role: UserRole.PARISH };
  // Wednesday 11 Nov 2026, 10:00 in Douala.
  const wednesdays = [
    '2026-11-11T09:00:00.000Z',
    '2026-11-18T09:00:00.000Z',
    '2026-11-25T09:00:00.000Z',
    '2026-12-02T09:00:00.000Z',
  ];
  // Thursday 12 Nov 2026, 10:00 in Douala.
  const thursdays = [
    '2026-11-12T09:00:00.000Z',
    '2026-11-19T09:00:00.000Z',
    '2026-11-26T09:00:00.000Z',
    '2026-12-03T09:00:00.000Z',
  ];

  /** Masses the parish already has, by startAt (ISO). */
  let existing: Set<string>;
  let tx: {
    $executeRaw: jest.Mock;
    mass: { findMany: jest.Mock; createManyAndReturn: jest.Mock };
    massPrice: { createMany: jest.Mock };
  };
  let prisma: {
    parish: { findUnique: jest.Mock };
    mass: { findFirst: jest.Mock };
    $transaction: jest.Mock;
  };
  let service: MassService;

  beforeEach(() => {
    existing = new Set();
    tx = {
      $executeRaw: jest.fn().mockResolvedValue(1),
      mass: {
        // Answers `startAt: { in: [...] }` from `existing`, like the DB would.
        findMany: jest.fn(async ({ where }) =>
          (where.startAt.in as Date[])
            .filter((date) => existing.has(date.toISOString()))
            .map((startAt) => ({ startAt }))
        ),
        createManyAndReturn: jest.fn(async ({ data }) =>
          data.map((mass: { startAt: Date }) => ({
            massId: `new-${mass.startAt.toISOString()}`,
          }))
        ),
      },
      massPrice: { createMany: jest.fn().mockResolvedValue({ count: 0 }) },
    };
    prisma = {
      parish: {
        findUnique: jest.fn().mockResolvedValue({ parishId: 'parish-1' }),
      },
      mass: {
        findFirst: jest.fn(async ({ where }) =>
          existing.has(where.startAt.toISOString()) ? { massId: 'old' } : null
        ),
      },
      $transaction: jest.fn((fn: (client: typeof tx) => unknown) => fn(tx)),
    };
    service = new MassService(prisma as unknown as PrismaService);
  });

  const weekly = (startAt: string, count = 4): CreateMassDto => ({
    price: 2500,
    startAt,
    massType: MassType.UNIQUE,
    recurrence: { interval: RecurrenceInterval.WEEKLY, count },
  });

  const createdDates = () =>
    (tx.mass.createManyAndReturn.mock.calls[0]?.[0].data ?? []).map(
      (mass: { startAt: Date }) => mass.startAt.toISOString()
    );

  it('creates 4 masses for "every week for 1 month", each with its XAF price', async () => {
    const result = await service.createMasses(weekly(wednesdays[0]), parishUser);

    expect(result).toMatchObject({ code: 201, created: 4, skipped: 0 });
    expect(createdDates()).toEqual(wednesdays);
    expect(tx.massPrice.createMany.mock.calls[0][0].data).toEqual(
      wednesdays.map((date) => ({
        massId: `new-${date}`,
        currency: 'XAF',
        amount: 2500,
        setByUserId: 'user-1',
      }))
    );
  });

  it("serializes a parish's creations with a lock taken before reading existing dates", async () => {
    await service.createMasses(weekly(wednesdays[0]), parishUser);

    const [sql, ...params] = tx.$executeRaw.mock.calls[0];
    expect(sql.join('?')).toContain('pg_advisory_xact_lock');
    expect(params).toEqual(['parish-1']);
    expect(tx.$executeRaw.mock.invocationCallOrder[0]).toBeLessThan(
      tx.mass.findMany.mock.invocationCallOrder[0]
    );
  });

  it('creates a second series alongside an existing one, touching none of the existing masses', async () => {
    wednesdays.forEach((date) => existing.add(date));

    const result = await service.createMasses(weekly(thursdays[0]), parishUser);

    expect(result).toMatchObject({ code: 201, created: 4, skipped: 0 });
    expect(createdDates()).toEqual(thursdays);
    const pricedIds = tx.massPrice.createMany.mock.calls[0][0].data.map(
      (price: { massId: string }) => price.massId
    );
    expect(pricedIds).toEqual(thursdays.map((date) => `new-${date}`));
  });

  it('skips the dates of an overlapping series and creates only the rest', async () => {
    existing.add(wednesdays[1]);
    existing.add(wednesdays[3]);

    const result = await service.createMasses(weekly(wednesdays[0]), parishUser);

    expect(result).toMatchObject({ code: 201, created: 2, skipped: 2 });
    expect(createdDates()).toEqual([wednesdays[0], wednesdays[2]]);
    expect(tx.massPrice.createMany.mock.calls[0][0].data).toHaveLength(2);
  });

  it('creates nothing and says so when every date already exists', async () => {
    wednesdays.forEach((date) => existing.add(date));

    const result = await service.createMasses(weekly(wednesdays[0]), parishUser);

    expect(result).toMatchObject({ code: 200, created: 0, skipped: 4 });
    expect(tx.mass.createManyAndReturn).not.toHaveBeenCalled();
    expect(tx.massPrice.createMany).not.toHaveBeenCalled();
  });

  it('treats a start time with stray milliseconds as the same mass', async () => {
    existing.add(wednesdays[0]);

    const result = await service.createMasses(
      weekly('2026-11-11T09:00:00.123Z'),
      parishUser
    );

    expect(result).toMatchObject({ created: 3, skipped: 1 });
  });

  it('creates a single mass when there is no recurrence', async () => {
    const result = await service.createMasses(
      { price: 2500, startAt: wednesdays[0], massType: MassType.UNIQUE },
      parishUser
    );

    expect(result).toMatchObject({ code: 201, created: 1, skipped: 0 });
    expect(createdDates()).toEqual([wednesdays[0]]);
  });

  it('rejects a single mass at a time the parish already has one', async () => {
    existing.add(wednesdays[0]);

    await expect(
      service.createMasses(
        { price: 2500, startAt: wednesdays[0], massType: MassType.UNIQUE },
        parishUser
      )
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('logs the real error before answering 500', async () => {
    const log = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    tx.massPrice.createMany.mockRejectedValue(new Error('unique violation'));

    await expect(
      service.createMasses(weekly(wednesdays[0]), parishUser)
    ).rejects.toBeInstanceOf(InternalServerErrorException);
    expect(log).toHaveBeenCalledWith(
      expect.stringContaining('parish-1'),
      expect.stringContaining('unique violation')
    );
    log.mockRestore();
  });
});

describe('MassService.markIntentionsSent', () => {
  it('locks the mass row, then marks it sent only if no unlisted order has been paid', async () => {
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([]),
      mass: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
    };
    const prisma = {
      $transaction: jest.fn((fn: (client: typeof tx) => unknown) => fn(tx)),
    };
    const service = new MassService(prisma as unknown as PrismaService);
    const sentAt = new Date('2026-11-11T08:30:00.000Z');

    await service.markIntentionsSent('mass-1', sentAt, ['order-1', 'order-2']);

    const [sql, ...params] = tx.$queryRaw.mock.calls[0];
    expect(sql.join('?')).toContain('FOR UPDATE');
    expect(params).toEqual(['mass-1']);
    expect(tx.mass.updateMany).toHaveBeenCalledWith({
      where: {
        massId: 'mass-1',
        massOrder: {
          none: {
            massOrderId: { notIn: ['order-1', 'order-2'] },
            payments: { some: { status: 'COMPLETED' } },
          },
        },
      },
      data: { intentionsSentAt: sentAt },
    });
    expect(tx.$queryRaw.mock.invocationCallOrder[0]).toBeLessThan(
      tx.mass.updateMany.mock.invocationCallOrder[0]
    );
  });
});
