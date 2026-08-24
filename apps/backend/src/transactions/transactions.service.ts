import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

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

  async findAllTransactionByParish(parishId: string) {
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
}
