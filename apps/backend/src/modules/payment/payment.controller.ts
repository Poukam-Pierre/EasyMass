import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../app/auth/guard/auth.guards';
import { PaymentService } from './payment.service';

@Controller('payment')
@UseGuards(AuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // @Public()
  // @Post('/collect')
  // handlePayment(
  //   @Body()
  //   handlePaymentDto: CreateTransactionDto,
  // ) {
  //   return this.paymentService.handlePayment(handlePaymentDto);
  // }

  // // TODO As this route is public, check if there is no scam. Put it a new guard just for validate that.
  // @Public()
  // @Post('/notifications')
  // notifyPayment(
  //   @Body()
  //   paymentResult: any,
  // ) {
  //   return this.paymentService.notifyPayment(paymentResult);
  // }

  // @Post('/withdraw')
  // withdrawMoney(
  //   @Req() request: Request,
  //   @Body() receiverNumber: string,
  //   amount: number,
  // ) {
  //   return this.paymentService.withdrawMoney(request, receiverNumber, amount);
  // }
}
