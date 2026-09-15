import { ForbiddenException, Injectable } from '@nestjs/common';
import { OwnerType, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { resolveParishForUser } from '../common/user.utils';
import { PaginatedResult, dateRangeFilter, toSkipTake } from '../common/pagination.utils';
import { FindTransactionsQueryDto } from './dto/find-transactions-query.dto';

/** Either the top-level PrismaService or an interactive-transaction client
 * (`tx` inside `prisma.$transaction(async (tx) => ...)`) — both expose the
 * same `.transaction` model delegate shape. */
type PrismaLike = PrismaService | Prisma.TransactionClient;

@Injectable()
export class TransactionsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createTransactionDto: Prisma.TransactionCreateInput) {
    return this.prismaService.transaction.create({
      data: createTransactionDto,
    });
  }

  async update(
    transactionId: string,
    updateTransactionDto: Prisma.TransactionUpdateInput
  ) {
    return this.prismaService.transaction.update({
      where: { transactionId },
      data: updateTransactionDto,
    });
  }

  private async assertCanViewParishTransactions(
    parishId: string,
    requestUser: { id: string; role: UserRole }
  ) {
    if (requestUser.role === UserRole.ADMIN) return;
    const parish = await resolveParishForUser(this.prismaService, requestUser.id);
    if (parish.parishId !== parishId) {
      throw new ForbiddenException("You may only view your own parish's transactions.", {
        cause: new Error(),
      });
    }
  }

  private static readonly TRANSACTION_ROW_SELECT = {
    transactionId: true,
    createdAt: true,
    amount: true,
    transactionType: true,
    balanceAfter: true,
    payment: {
      select: {
        paymentMethod: true,
        status: true,
        currency: true,
      },
    },
  } as const;

  /** Unbounded — kept exactly as-is for existing callers (admin-ui's
   * Finances page and its parish-detail Transactions tab) that read the
   * whole list at once and take transactions[0].balanceAfter as the
   * current running balance. New callers that need pagination/filtering
   * should use findAllTransactionByParishPaginated instead, which computes
   * the balance independently so it stays correct under a filter. */
  async findAllTransactionByParish(
    parishId: string,
    requestUser: { id: string; role: UserRole }
  ) {
    await this.assertCanViewParishTransactions(parishId, requestUser);

    return this.prismaService.transaction.findMany({
      where: {
        ownerId: parishId,
        ownerType: 'PARISH',
      },
      orderBy: { createdAt: 'desc' },
      select: TransactionsService.TRANSACTION_ROW_SELECT,
    });
  }

  /**
   * Paginated, optionally filtered (type, createdAt range) — plus the
   * parish's *current* balance, computed independently of whatever page/
   * filter is active (never transactions[0].balanceAfter, which only means
   * "current balance" on an unfiltered, first page).
   */
  async findAllTransactionByParishPaginated(
    parishId: string,
    query: FindTransactionsQueryDto,
    requestUser: { id: string; role: UserRole }
  ): Promise<PaginatedResult<unknown> & { currentBalance: number }> {
    await this.assertCanViewParishTransactions(parishId, requestUser);

    const { skip, take, page, limit } = toSkipTake(query.page, query.limit);
    const range = dateRangeFilter(query.from, query.to);
    const where: Prisma.TransactionWhereInput = {
      ownerId: parishId,
      ownerType: 'PARISH',
      ...(query.transactionType ? { transactionType: query.transactionType } : {}),
      ...(range ? { createdAt: range } : {}),
    };

    const [data, total, currentBalance] = await Promise.all([
      this.prismaService.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: TransactionsService.TRANSACTION_ROW_SELECT,
      }),
      this.prismaService.transaction.count({ where }),
      this.getCurrentBalance(this.prismaService, parishId, 'PARISH'),
    ]);

    return { data, total, page, limit, currentBalance };
  }

  async findOne(transactionId: string) {
    return this.prismaService.transaction.findUnique({
      where: {
        transactionId,
      },
    });
  }

  /** Running balance for one owner — last row's balanceAfter, or 0 if none. */
  async getCurrentBalance(
    client: PrismaLike,
    ownerId: string,
    ownerType: OwnerType
  ): Promise<number> {
    const last = await client.transaction.findFirst({
      where: { ownerId, ownerType },
      orderBy: { createdAt: 'desc' },
      select: { balanceAfter: true },
    });
    return last?.balanceAfter ?? 0;
  }

  /** Creates a Transaction with balanceAfter computed as
   * currentBalance + amount. Pass the interactive-transaction `tx` client
   * when this needs to be atomic with other writes (e.g. a payment's
   * multiple split rows) — sequential calls within the same `tx` correctly
   * see each other's uncommitted writes. */
  async createWithBalance(
    client: PrismaLike,
    data: Omit<Prisma.TransactionCreateInput, 'balanceAfter'> & {
      ownerId: string;
      ownerType: OwnerType;
      amount: number;
    }
  ) {
    const previous = await this.getCurrentBalance(
      client,
      data.ownerId,
      data.ownerType
    );
    return client.transaction.create({
      data: { ...data, balanceAfter: previous + data.amount },
    });
  }

  /** Like createWithBalance, but takes the already-known previous balance
   * instead of querying for it — for callers writing several rows for the
   * same owner in one batch (e.g. a multi-mass checkout), so the running
   * balance is tracked in memory instead of one query per row. Returns the
   * created row's balanceAfter so the caller can chain the next one. */
  async createAtBalance(
    client: PrismaLike,
    data: Omit<Prisma.TransactionCreateInput, 'balanceAfter'> & {
      ownerId: string;
      ownerType: OwnerType;
      amount: number;
    },
    previousBalance: number
  ) {
    const balanceAfter = previousBalance + data.amount;
    const record = await client.transaction.create({
      data: { ...data, balanceAfter },
    });
    return { record, balanceAfter };
  }

  /** Admin-only manual ledger fix — an ADMIN_CORRECTION row, never an edit
   * to an existing row. Serializable so it can't race a concurrent
   * payment/withdrawal/refund for the same owner into a lost update. */
  async createCorrection(
    ownerId: string,
    ownerType: OwnerType,
    amount: number,
    note: string,
    createdByUserId: string
  ) {
    return this.prismaService.runSerializableTransaction((tx) =>
      this.createWithBalance(tx, {
        transactionType: 'ADMIN_CORRECTION',
        ownerId,
        ownerType,
        amount,
        note,
        createdByUser: { connect: { userId: createdByUserId } },
      })
    );
  }
}
