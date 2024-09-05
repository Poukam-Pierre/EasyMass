import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTransactionDto {
  believerInfo: BelieverInfo;
  massInfo: MassInfos[];
  paymentInfo: OrderInfo;
}

class BelieverInfo {
  @IsString()
  name?: string;
  phone?: string;
}

class MassInfos {
  @IsNumber()
  @IsNotEmpty()
  id: number;
  price: number;

  @IsString()
  @IsNotEmpty()
  processAt: string;
  intension: string;

  massType: string;
}

class OrderInfo {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  phone: string;
}
