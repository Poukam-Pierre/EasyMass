import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Currency, PlatformSettings } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BASE_CURRENCY } from '../common/constants';
import { UpdatePlatformSettingsDto } from './dto/update-platform-settings.dto';

@Injectable()
export class PlatformSettingsService {
  constructor(private readonly prismaService: PrismaService) {}

  /** The base currency (XAF) must always resolve — mobile money checkouts
   * are XAF-only, so this auto-creates a neutral (0%/0-fixed) default row
   * on first read, same as the old singleton used to. Every other currency
   * requires an explicit admin-created row; returns null if none exists so
   * the caller can reject the checkout with a clear error. */
  async getForCurrency(currency: Currency): Promise<PlatformSettings | null> {
    if (currency === BASE_CURRENCY) {
      return this.prismaService.platformSettings.upsert({
        where: { currency },
        create: { currency },
        update: {},
      });
    }
    return this.prismaService.platformSettings.findUnique({
      where: { currency },
    });
  }

  async findAll() {
    return this.prismaService.platformSettings.findMany();
  }

  async upsert(
    currency: Currency,
    dto: Omit<UpdatePlatformSettingsDto, 'currency'>,
    updatedByUserId: string
  ) {
    return this.prismaService.platformSettings.upsert({
      where: { currency },
      create: { currency, ...dto, updatedByUserId },
      update: { ...dto, updatedByUserId },
    });
  }

  /** XAF must always resolve (mobile money is XAF-only) — refuse to
   * delete it rather than let a later checkout hit a missing-config error
   * for the one currency that's supposed to never fail. */
  async remove(currency: Currency) {
    if (currency === BASE_CURRENCY) {
      throw new BadRequestException('baseCurrencyCannotBeRemoved', {
        cause: new Error(),
        description: `The ${BASE_CURRENCY} platform fee configuration cannot be removed.`,
      });
    }
    const existing = await this.prismaService.platformSettings.findUnique({
      where: { currency },
    });
    if (!existing) {
      throw new NotFoundException('platformFeeNotConfiguredForCurrency', {
        cause: new Error(),
        description: `No platform fee configuration exists for ${currency}.`,
      });
    }
    return this.prismaService.platformSettings.delete({
      where: { currency },
    });
  }

  /**
   * The platform's fee for one mass order, ADDED ON TOP of the mass's base
   * price (Mass.price/MassPrice) — the parish always receives that base
   * price in full; this is purely additional platform revenue, not a cut
   * carved out of the parish's share. `settings` is already the row for
   * the checkout's own currency (via getForCurrency), so both basePrice
   * and the fee share one currency by construction — no FX conversion
   * happens here. Pure/sync so callers computing fees for many orders in
   * one checkout can call this N times without N DB round trips —
   * important when called from inside an interactive $transaction.
   */
  computeFee(
    settings: Pick<
      PlatformSettings,
      'platformFeePercentage' | 'platformFeeFixedAmount'
    >,
    basePrice: number
  ): number {
    return (
      basePrice * (settings.platformFeePercentage / 100) +
      settings.platformFeeFixedAmount
    );
  }
}
