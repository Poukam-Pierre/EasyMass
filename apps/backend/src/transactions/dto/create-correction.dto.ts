import { OwnerType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCorrectionDto {
  @IsString()
  @IsNotEmpty()
  ownerId: string;

  @IsEnum(OwnerType)
  ownerType: OwnerType;

  /** Positive to credit the owner, negative to debit. */
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  note: string;
}
