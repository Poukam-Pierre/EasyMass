import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ['warn', 'error'], // Enhanced logging for development
    });
  }
  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * For writes that read a current value (e.g. a ledger's running balance)
   * and then write based on it — a plain transaction at the default READ
   * COMMITTED isolation does NOT prevent two concurrent callers from both
   * reading the same starting value and each committing a write based on
   * it (a lost update), since the two writes don't touch the same row.
   * SERIALIZABLE isolation makes Postgres detect that conflict and abort
   * one side with a serialization failure (Prisma error P2034), which this
   * retries with a fresh read.
   */
  async runSerializableTransaction<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
    options?: { timeout?: number; maxWait?: number; retries?: number }
  ): Promise<T> {
    const retries = options?.retries ?? 3;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await this.$transaction(fn, {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          timeout: options?.timeout ?? 15000,
          maxWait: options?.maxWait ?? 10000,
        });
      } catch (error) {
        const isSerializationConflict = error?.code === 'P2034';
        if (!isSerializationConflict || attempt === retries) throw error;
      }
    }
    // Unreachable — the loop always returns or throws.
    throw new Error('runSerializableTransaction: exhausted retries');
  }
}
