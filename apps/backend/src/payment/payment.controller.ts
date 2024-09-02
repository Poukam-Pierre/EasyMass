import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { AuthGuard } from '../auth/guard/auth.guards';
import { Public } from '../auth/decorator/public.decorator';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('payment')
@UseGuards(AuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Public()
  @Post('/collect')
  handlePayment(
    @Body()
    handlePaymentDto: CreateTransactionDto
  ) {
    return this.paymentService.handlePayment(handlePaymentDto);
  }

  // TODO As this route is public, check if there is no scam. Put it a new guard just for validate that.
  @Public()
  @Post('/notifications')
  notifyPayment(
    @Body()
    paymentResult
  ) {
    return this.paymentService.notifyPayment(paymentResult);
  }

  @Post('/withdraw')
  withdrawMoney(
    @Request() request,
    @Body() receiverNumber: string,
    amount: number
  ) {
    return this.paymentService.withdrawMoney(request, receiverNumber, amount);
  }
}
