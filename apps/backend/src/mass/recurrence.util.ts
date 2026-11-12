export enum RecurrenceInterval {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

interface WallClock {
  year: number;
  /** 0-indexed, like Date.UTC. */
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

const formatters = new Map<string, Intl.DateTimeFormat>();

function wallClockIn(instant: Date, timeZone: string): WallClock {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
    formatters.set(timeZone, formatter);
  }
  const parts = Object.fromEntries(
    formatter
      .formatToParts(instant)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, Number(part.value)])
  );
  return {
    year: parts.year,
    month: parts.month - 1,
    day: parts.day,
    hour: parts.hour,
    minute: parts.minute,
    second: parts.second,
  };
}

/** How far `timeZone` is ahead of UTC at `instant`, in ms. */
function offsetAt(instant: number, timeZone: string): number {
  const wall = wallClockIn(new Date(instant), timeZone);
  const wallAsUtc = Date.UTC(
    wall.year,
    wall.month,
    wall.day,
    wall.hour,
    wall.minute,
    wall.second
  );
  return wallAsUtc - Math.floor(instant / 1000) * 1000;
}

/** The instant at which the clock in `timeZone` reads `wall`. Day/month
 * overflow is normalised the same way Date.UTC does (day 32 → next month).
 * The second offset check covers zones whose offset differs between the
 * naive guess and the real instant (DST changes). */
function instantOf(wall: WallClock, timeZone: string): Date {
  const naive = Date.UTC(
    wall.year,
    wall.month,
    wall.day,
    wall.hour,
    wall.minute,
    wall.second
  );
  const firstGuess = naive - offsetAt(naive, timeZone);
  const offset = offsetAt(firstGuess, timeZone);
  return new Date(naive - offset);
}

/** Weekday (0 = Sunday) of a calendar date; the time zone plays no part. */
function weekdayOf(year: number, month: number, day: number): number {
  return new Date(Date.UTC(year, month, day)).getUTCDay();
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

/**
 * Exactly `count` occurrences of a recurring mass, the first being `start`
 * itself, all at start's wall-clock time in `timeZone`. Dates are worked out
 * on the parish's calendar, not the server's (which runs in UTC), so a mass
 * at 00:30 in Douala never slides to the previous day.
 *
 * - WEEKLY: every 7 days, so the weekday never changes.
 * - MONTHLY: one per month, on the same "Nth weekday" as start (2nd Monday
 *   → each month's 2nd Monday). If start is a 5th weekday, which most
 *   months don't have, the series uses each month's last such weekday
 *   instead, so there's still exactly one mass a month.
 */
export function generateRecurrenceDates(
  start: Date,
  interval: RecurrenceInterval,
  count: number,
  timeZone: string
): Date[] {
  const wall = wallClockIn(start, timeZone);
  const at = (year: number, month: number, day: number) =>
    instantOf({ ...wall, year, month, day }, timeZone);

  if (interval === RecurrenceInterval.WEEKLY) {
    return Array.from({ length: count }, (_, i) =>
      at(wall.year, wall.month, wall.day + 7 * i)
    );
  }

  const weekday = weekdayOf(wall.year, wall.month, wall.day);
  const occurrence = Math.floor((wall.day - 1) / 7); // 0 = 1st … 4 = 5th
  const useLast = occurrence >= 4;

  return Array.from({ length: count }, (_, i) => {
    const first = new Date(Date.UTC(wall.year, wall.month + i, 1));
    const year = first.getUTCFullYear();
    const month = first.getUTCMonth();

    if (useLast) {
      const lastDay = daysInMonth(year, month);
      const back = (weekdayOf(year, month, lastDay) - weekday + 7) % 7;
      return at(year, month, lastDay - back);
    }
    const firstMatch = 1 + ((weekday - first.getUTCDay() + 7) % 7);
    return at(year, month, firstMatch + 7 * occurrence);
  });
}
