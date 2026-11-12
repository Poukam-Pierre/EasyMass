import { MassType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { RecurrenceInterval } from '../recurrence.util';

export { RecurrenceInterval };

/** A year of weekly masses. */
export const MAX_RECURRENCE_COUNT = 52;

export class RecurrenceDto {
  @IsEnum(RecurrenceInterval)
  interval: RecurrenceInterval;

  /** How many masses the series has in total, the first one (startAt)
   * included. The frontend derives it from a duration preset: weekly 1/3/6
   * months or 1 year → 4/13/26/52; monthly 3/6 months or 1 year → 3/6/12.
   * A fixed count, unlike an end date, never depends on the weekday or
   * month the series starts in. */
  @IsInt()
  @Min(2)
  @Max(MAX_RECURRENCE_COUNT)
  count: number;
}

export class CreateMassDto {
  @IsNumber()
  @Min(0)
  price: number;

  @IsDateString()
  startAt: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  estimatedDurationMinutes?: number;

  @IsEnum(MassType)
  massType: MassType;

  /** Absent → create just the one mass. Present → create `count` masses
   * starting at startAt (WEEKLY every 7 days; MONTHLY on the same "Nth
   * weekday of the month" as startAt — see generateRecurrenceDates). */
  @IsOptional()
  @ValidateNested()
  @Type(() => RecurrenceDto)
  recurrence?: RecurrenceDto;
}
