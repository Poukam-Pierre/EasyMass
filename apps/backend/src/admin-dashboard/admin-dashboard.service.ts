import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prismaService: PrismaService) {}

  async moneyOverview() {
    const [parishIncome, platformFeeRevenue, withdrawals, incomeRows] =
      await Promise.all([
        this.prismaService.transaction.aggregate({
          where: { ownerType: 'PARISH', transactionType: 'INCOME' },
          _sum: { amount: true },
        }),
        this.prismaService.transaction.aggregate({
          where: { ownerType: 'ADMIN', transactionType: 'PLATFORM_FEE' },
          _sum: { amount: true },
        }),
        this.prismaService.transaction.aggregate({
          where: { transactionType: 'WITHDRAWAL' },
          _sum: { amount: true },
        }),
        this.prismaService.transaction.findMany({
          where: { ownerType: 'PARISH', transactionType: 'INCOME' },
          select: { amount: true, createdAt: true },
        }),
      ]);

    const revenueByMonth = new Map<string, number>();
    for (const row of incomeRows) {
      const key = row.createdAt.toISOString().slice(0, 7); // YYYY-MM
      revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + row.amount);
    }

    return {
      totalParishIncome: parishIncome._sum.amount ?? 0,
      totalPlatformFeeRevenue: platformFeeRevenue._sum.amount ?? 0,
      totalWithdrawn: Math.abs(withdrawals._sum.amount ?? 0),
      revenueByMonth: Array.from(revenueByMonth.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, amount]) => ({ month, amount })),
    };
  }

  async parishOverview() {
    const [
      totalParishes,
      activeParishes,
      parishesWithCity,
      massCounts,
      topIncome,
      recentlyOnboarded,
    ] = await Promise.all([
      this.prismaService.parish.count(),
      this.prismaService.parish.count({ where: { isBlocked: false } }),
      this.prismaService.parish.findMany({
        select: { parishId: true, name: true, city: { select: { city_name: true } } },
      }),
      this.prismaService.mass.groupBy({
        by: ['parishId'],
        _count: { massId: true },
        orderBy: { _count: { massId: 'desc' } },
        take: 5,
      }),
      this.prismaService.transaction.groupBy({
        by: ['ownerId'],
        where: { ownerType: 'PARISH', transactionType: 'INCOME' },
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 5,
      }),
      this.prismaService.parish.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { parishId: true, name: true, createdAt: true },
      }),
    ]);

    const nameById = new Map(parishesWithCity.map((p) => [p.parishId, p.name]));
    const cityCounts = new Map<string, number>();
    for (const p of parishesWithCity) {
      const city = p.city?.city_name ?? 'Unknown';
      cityCounts.set(city, (cityCounts.get(city) ?? 0) + 1);
    }

    return {
      totalParishes,
      activeParishes,
      blockedParishes: totalParishes - activeParishes,
      parishesByCity: Array.from(cityCounts.entries()).map(
        ([cityName, count]) => ({ cityName, count })
      ),
      topParishesByMassesCreated: massCounts.map((m) => ({
        parishId: m.parishId,
        name: nameById.get(m.parishId) ?? 'Unknown',
        massCount: m._count.massId,
      })),
      topParishesByIncome: topIncome.map((t) => ({
        parishId: t.ownerId,
        name: nameById.get(t.ownerId) ?? 'Unknown',
        totalIncome: t._sum.amount ?? 0,
      })),
      recentlyOnboarded,
    };
  }
}
