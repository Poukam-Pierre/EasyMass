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
    id: number,
    updateTransactionDto: Prisma.TransactionUpdateInput
  ) {
    return this.prismaService.transaction.update({
      where: { id },
      data: updateTransactionDto,
    });
  }
}
