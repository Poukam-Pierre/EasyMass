import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTransactionDto {
  believerInfo: BelieverInfo;
  massInfo: MassInfo[];
  paymentInfo: OrderInfo;
}

class BelieverInfo {
  @IsString()
  name?: string;
  phone?: string;
}

class MassInfo {
  @IsNumber()
  @IsNotEmpty()
  id: number;
  price: number;

  @IsString()
  @IsNotEmpty()
  parish: string;
  dataTime: string;
  intention: string;
}

class OrderInfo {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  phone?: string;
}
