import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { AuthGuard } from '../auth/guard/auth.guards';
import { Public } from '../auth/decorator/public.decorator';

@Controller('payment')
@UseGuards(AuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Public()
  @Post()
  handlePayment(
    @Body()
    paymentInfos: {
      amount: number;
      currency: string;
      channel: string;
      customer: {
        name: string;
        phone: string;
      };
      metadata?: Array<object>;
    }
  ) {
    return this.paymentService.handlePayment(paymentInfos);
  }

  // TODO As this route is public, check if there is no scam good. Put it a new guard just for validate that.
  @Public()
  @Post('/notifications')
  notifyPayment(@Body() paymentResult: object) {
    return this.paymentService.notifyPayment(paymentResult);
  }
}
