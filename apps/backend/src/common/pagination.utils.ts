export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/** Prisma skip/take from a 1-indexed page + page size, returned alongside
 * the normalized page/limit themselves so a caller can echo back exactly
 * what was actually used (never trust the raw input back verbatim). Coerces
 * defensively with Number(...) rather than trusting the value is already a
 * number — the app's global ValidationPipe doesn't run with `transform:
 * true`, so a query param DTO's @Type(() => Number) only validates the
 * shape, it doesn't actually convert what reaches the handler. */
export function toSkipTake(
  page?: number | string,
  limit?: number | string
): { skip: number; take: number; page: number; limit: number } {
  const normalizedPage = Math.max(1, Number(page) || 1);
  const normalizedLimit = Math.max(1, Number(limit) || 25);
  return {
    skip: (normalizedPage - 1) * normalizedLimit,
    take: normalizedLimit,
    page: normalizedPage,
    limit: normalizedLimit,
  };
}

/** A `createdAt`-style range filter from optional ISO date strings — both
 * bounds optional, `undefined` (not an empty object) when neither is given
 * so it can be spread straight into a Prisma `where` without adding a
 * no-op `createdAt: {}` clause. */
export function dateRangeFilter(
  from?: string,
  to?: string
): { gte?: Date; lte?: Date } | undefined {
  if (!from && !to) return undefined;
  return {
    ...(from ? { gte: new Date(from) } : {}),
    ...(to ? { lte: new Date(to) } : {}),
  };
}
