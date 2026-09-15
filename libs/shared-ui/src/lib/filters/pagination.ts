import { Dayjs } from 'dayjs';

/** Rows per page for every paginated table across admin-ui and parish —
 * one place to change it everywhere at once. */
export const DEFAULT_PAGE_SIZE = 25;

/** ISO from/to query params from optional Dayjs bounds — `from` snapped to
 * the start of that day, `to` to its end, so a same-day range is inclusive.
 * Returns {} for an unset bound (never `undefined`), so this is always safe
 * to spread straight into an axios `params` object. Shared by every table
 * that filters by a createdAt-style date range. */
export function dateRangeParams(
  from: Dayjs | null,
  to: Dayjs | null
): { from?: string; to?: string } {
  return {
    ...(from ? { from: from.startOf('day').toISOString() } : {}),
    ...(to ? { to: to.endOf('day').toISOString() } : {}),
  };
}
