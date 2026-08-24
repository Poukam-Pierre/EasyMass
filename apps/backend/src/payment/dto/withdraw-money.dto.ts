import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class WithdrawMoneyDto {
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  amount: number;
}
