import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

/** startAt/estimatedDurationMinutes may only be changed while the mass is
 * still OPEN (enforced in MassService.update) — once ordering has closed,
 * retroactively moving the schedule would strand it in an inconsistent
 * lifecycle state. */
export class UpdateMassDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsDateString()
  @IsOptional()
  startAt?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  estimatedDurationMinutes?: number;

  @IsOptional()
  intension?: string;

  @IsOptional()
  priestId?: string;
}
