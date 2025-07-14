import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createTransactionDto: Prisma.TransactionCreateInput) {
    return this.prismaService.transaction.create({
      data: createTransactionDto,
    });
  }

  async update(
    id: number,
    updateTransactionDto: Prisma.TransactionUpdateInput,
  ) {
    return this.prismaService.transaction.update({
      where: { id },
      data: updateTransactionDto,
    });
  }

  async findAllTransactionByParish(id: number) {
    return this.prismaService.transaction.findMany({
      where: {
        parishId: id,
      },
      select: {
        id: true,
        transactionId: true,
        createdAt: true,
        price: true,
        status: true,
        paymentMethod: true,
        currency: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prismaService.transaction.findUnique({
      where: {
        transactionId: id,
      },
    });
  }
}
