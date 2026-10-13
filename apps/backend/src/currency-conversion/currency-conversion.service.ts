import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Currency } from '@prisma/client';
import { BASE_CURRENCY } from '../common/constants';

interface CachedRate {
  rate: number;
  expiresAt: number;
}

/** How long a fetched rate is trusted before re-fetching — a "cache for a
 * day" TTL. Exchange rates don't move fast enough for a mass-offering
 * payment to need anything fresher, and it keeps this free API off the hot
 * path for the (presumably common) case of repeated non-XAF checkouts. */
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

/**
 * Converts an amount from any Currency into BASE_CURRENCY (XAF) — needed
 * because Transaction (the internal ledger) has no currency column at all;
 * everything written to it must already be in XAF, regardless of what
 * currency the believer actually paid in. Only ever called from
 * PaymentService.finalizeCheckout, right before writing the ledger split —
 * Payment/MassOrder themselves stay in whatever currency was actually
 * charged, unconverted.
 */
@Injectable()
export class CurrencyConversionService {
  private readonly cache = new Map<Currency, CachedRate>();

  /** Units of BASE_CURRENCY per 1 unit of `from` — multiply an amount in
   * `from` by this to get the equivalent in BASE_CURRENCY. Always 1 for
   * BASE_CURRENCY itself (no network call). */
  async getRateToBaseCurrency(from: Currency): Promise<number> {
    if (from === BASE_CURRENCY) return 1;

    const cached = this.cache.get(from);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.rate;
    }

    // Free, keyless exchange-rate API — no account/credentials to manage.
    // If this ever needs swapping (rate limits, reliability), only this
    // one fetch call changes.
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${from}`
    ).then((res) => res.json());

    const rate = response?.rates?.[BASE_CURRENCY];
    if (typeof rate !== 'number') {
      throw new UnprocessableEntityException(
        `Could not resolve an exchange rate from ${from} to ${BASE_CURRENCY}.`
      );
    }

    this.cache.set(from, { rate, expiresAt: Date.now() + CACHE_TTL_MS });
    return rate;
  }

  async convertToBaseCurrency(amount: number, from: Currency): Promise<number> {
    const rate = await this.getRateToBaseCurrency(from);
    return amount * rate;
  }
}
