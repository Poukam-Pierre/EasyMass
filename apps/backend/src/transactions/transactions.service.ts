import { ForbiddenException, Injectable } from '@nestjs/common';
import { OwnerType, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { resolveParishForUser } from '../common/user.utils';

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

  async findAllTransactionByParish(
    parishId: string,
    requestUser: { id: string; role: UserRole }
  ) {
    if (requestUser.role !== UserRole.ADMIN) {
      const parish = await resolveParishForUser(
        this.prismaService,
        requestUser.id
      );
      if (parish.parishId !== parishId) {
        throw new ForbiddenException('Forbidden', {
          cause: new Error(),
          description: "You may only view your own parish's transactions.",
        });
      }
    }

    return this.prismaService.transaction.findMany({
      where: {
        ownerId: parishId,
        ownerType: 'PARISH',
      },
      select: {
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
      },
    });
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
