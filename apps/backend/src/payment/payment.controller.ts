import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  handlePayment(
    @Body()
    paymentInfos: {
      amount: number;
      currency: string;
      channel: string;
      customer: {
        phone: string;
      };
      metadata?: Array<object>;
    }
  ) {
    return this.paymentService.handlePayment(paymentInfos);
  }
}
