import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class WithdrawMoneyDto {
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  amount: number;

  // Re-checked server-side against the caller's own stored hash via
  // verifyCurrentPassword before the withdrawal proceeds — see
  // PaymentService.withdrawMoney.
  @IsString()
  @IsNotEmpty()
  password: string;
}
