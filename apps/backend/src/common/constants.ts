import { Currency } from '@prisma/client';

/** Transaction.ownerId sentinel for the platform's own ledger (ownerType
 * ADMIN, transactionType PLATFORM_FEE/ADMIN_CORRECTION). ownerId has no real
 * FK for polymorphic owners (see schema review), so this is just a stable
 * constant, not a row in any table. */
export const PLATFORM_OWNER_ID = 'platform';

/** The currency the internal ledger (Transaction) is always denominated in
 * — Transaction has no currency column, so every amount written to it must
 * already be in this currency. Also the currency Mass.price is denominated
 * in when no explicit MassPrice override exists for the requested
 * currency (matches MassOrder.currency's schema default). */
export const BASE_CURRENCY: Currency = Currency.XAF;

/** IANA time zone every user-facing date (emails, PDFs) is rendered in —
 * Mass.startAt is stored in UTC and the server itself runs in UTC, so
 * without an explicit zone a 13:15 WAT mass would read as 12:15. No
 * per-parish zone is stored yet; this matches the platform's XAF base. */
export const DISPLAY_TIME_ZONE = process.env.DISPLAY_TIME_ZONE || 'Africa/Douala';
