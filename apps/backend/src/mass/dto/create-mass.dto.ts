import { MassType } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

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

  @IsBoolean()
  replicate: boolean;
}
