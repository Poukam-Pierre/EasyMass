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
   * The platform's fee for one mass order, ADDED ON TOP of the mass's base
   * price (Mass.price/MassPrice) — the parish always receives that base
   * price in full; this is purely additional platform revenue, not a cut
   * carved out of the parish's share. Pure/sync so callers computing fees
   * for many orders in one checkout can fetch settings once (via get())
   * and call this N times without N DB round trips — important when called
   * from inside an interactive $transaction.
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
