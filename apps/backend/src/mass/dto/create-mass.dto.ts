import { MassType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';

export enum RecurrenceInterval {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export class RecurrenceDto {
  @IsEnum(RecurrenceInterval)
  interval: RecurrenceInterval;

  /** Inclusive end of the recurrence window — the frontend derives this
   * from a duration preset (1/3/6 months, 1 year) rather than asking a
   * parish user to pick an arbitrary date. */
  @IsDateString()
  until: string;
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

  /** Absent → create just the one mass. Present → also create one mass per
   * occurrence of this recurrence rule between startAt and until (e.g.
   * WEEKLY repeats every 7 days; MONTHLY repeats on the same "Nth weekday
   * of the month" as startAt — see MassService.generateRecurrenceDates). */
  @IsOptional()
  @ValidateNested()
  @Type(() => RecurrenceDto)
  recurrence?: RecurrenceDto;
}
