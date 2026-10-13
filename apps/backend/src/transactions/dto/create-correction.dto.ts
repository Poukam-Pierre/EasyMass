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

  /** Re-proves the caller's identity right before this specific action —
   * a valid JWT alone isn't enough for a correction, since a hijacked
   * session/unattended admin screen shouldn't be able to move money.
   * Verified server-side against the admin's stored password hash. */
  @IsString()
  @IsNotEmpty()
  password: string;
}
