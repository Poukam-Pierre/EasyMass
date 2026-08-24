import { Injectable } from '@nestjs/common';
import { PlatformSettings } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePlatformSettingsDto } from './dto/update-platform-settings.dto';

const SETTINGS_ID = 1;

@Injectable()
export class PlatformSettingsService {
  constructor(private readonly prismaService: PrismaService) {}

  /** Singleton row — created with defaults (0% / 0 fixed) on first read. */
  async get() {
    return this.prismaService.platformSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID },
      update: {},
    });
  }

  async update(dto: UpdatePlatformSettingsDto, updatedByUserId: string) {
    return this.prismaService.platformSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID, ...dto, updatedByUserId },
      update: { ...dto, updatedByUserId },
    });
  }

  /**
   * Splits a mass order's price into the platform's cut and the parish's
   * share, per the current fee settings. platformFee is clamped so it never
   * exceeds price (the parish's share can never go negative). Pure/sync so
   * callers splitting many orders in one checkout can fetch settings once
   * (via get()) and call this N times without N DB round trips — important
   * when called from inside an interactive $transaction.
   */
  splitPrice(
    settings: Pick<
      PlatformSettings,
      'platformFeePercentage' | 'platformFeeFixedAmount'
    >,
    price: number
  ): { platformFee: number; parishShare: number } {
    const rawFee =
      price * (settings.platformFeePercentage / 100) +
      settings.platformFeeFixedAmount;
    const platformFee = Math.min(Math.max(rawFee, 0), price);
    return { platformFee, parishShare: price - platformFee };
  }

  /** Convenience for a single split — fetches settings then applies them. */
  async computeSplit(
    price: number
  ): Promise<{ platformFee: number; parishShare: number }> {
    const settings = await this.get();
    return this.splitPrice(settings, price);
  }
}
