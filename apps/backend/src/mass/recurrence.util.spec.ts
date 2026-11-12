import {
  generateRecurrenceDates,
  RecurrenceInterval,
} from './recurrence.util';

const DOUALA = 'Africa/Douala'; // UTC+1 all year
const iso = (dates: Date[]) => dates.map((date) => date.toISOString());

describe('generateRecurrenceDates', () => {
  describe('weekly', () => {
    it('gives exactly 4 masses for "every week for 1 month", same weekday and time', () => {
      // Wednesday 11 Nov 2026, 10:00 in Douala.
      const start = new Date('2026-11-11T09:00:00.000Z');

      expect(
        iso(generateRecurrenceDates(start, RecurrenceInterval.WEEKLY, 4, DOUALA))
      ).toEqual([
        '2026-11-11T09:00:00.000Z',
        '2026-11-18T09:00:00.000Z',
        '2026-11-25T09:00:00.000Z',
        '2026-12-02T09:00:00.000Z',
      ]);
    });

    it('gives 52 masses for a year, ending 51 weeks after the start', () => {
      const start = new Date('2026-11-11T09:00:00.000Z');
      const dates = generateRecurrenceDates(
        start,
        RecurrenceInterval.WEEKLY,
        52,
        DOUALA
      );

      expect(dates).toHaveLength(52);
      expect(dates[51].toISOString()).toBe('2027-11-03T09:00:00.000Z');
    });

    it('keeps the Douala weekday for a mass just after local midnight', () => {
      // Monday 16 Nov 2026, 00:30 in Douala = Sunday 23:30 UTC.
      const start = new Date('2026-11-15T23:30:00.000Z');

      expect(
        iso(generateRecurrenceDates(start, RecurrenceInterval.WEEKLY, 2, DOUALA))
      ).toEqual(['2026-11-15T23:30:00.000Z', '2026-11-22T23:30:00.000Z']);
    });

    it('keeps the local time across a DST change', () => {
      // Wednesday 21 Oct 2026, 10:00 in Paris (CEST, UTC+2); DST ends on
      // 25 Oct, so the next 10:00 is CET (UTC+1).
      const start = new Date('2026-10-21T08:00:00.000Z');

      expect(
        iso(
          generateRecurrenceDates(
            start,
            RecurrenceInterval.WEEKLY,
            2,
            'Europe/Paris'
          )
        )
      ).toEqual(['2026-10-21T08:00:00.000Z', '2026-10-28T09:00:00.000Z']);
    });
  });

  describe('monthly', () => {
    it('gives one mass a month on the same Nth weekday, across the year end', () => {
      // 11 Nov 2026 is the 2nd Wednesday.
      const start = new Date('2026-11-11T09:00:00.000Z');

      expect(
        iso(
          generateRecurrenceDates(start, RecurrenceInterval.MONTHLY, 3, DOUALA)
        )
      ).toEqual([
        '2026-11-11T09:00:00.000Z',
        '2026-12-09T09:00:00.000Z',
        '2027-01-13T09:00:00.000Z',
      ]);
    });

    it('works out the weekday on the Douala calendar, not UTC', () => {
      // 3rd Monday of Nov 2026 at 00:30 in Douala (still Sunday in UTC).
      const start = new Date('2026-11-15T23:30:00.000Z');

      expect(
        iso(
          generateRecurrenceDates(start, RecurrenceInterval.MONTHLY, 3, DOUALA)
        )
      ).toEqual([
        '2026-11-15T23:30:00.000Z',
        '2026-12-20T23:30:00.000Z', // Mon 21 Dec, Douala
        '2027-01-17T23:30:00.000Z', // Mon 18 Jan, Douala
      ]);
    });

    it('uses the last weekday of each month when the start is a 5th weekday', () => {
      // 30 Dec 2026 is the 5th Wednesday; Jan and Feb 2027 only have 4.
      const start = new Date('2026-12-30T09:00:00.000Z');

      expect(
        iso(
          generateRecurrenceDates(start, RecurrenceInterval.MONTHLY, 3, DOUALA)
        )
      ).toEqual([
        '2026-12-30T09:00:00.000Z',
        '2027-01-27T09:00:00.000Z',
        '2027-02-24T09:00:00.000Z',
      ]);
    });

    it('gives 12 masses for a year', () => {
      const start = new Date('2026-11-11T09:00:00.000Z');

      expect(
        generateRecurrenceDates(start, RecurrenceInterval.MONTHLY, 12, DOUALA)
      ).toHaveLength(12);
    });
  });
});
