import {
  Body,
  Controller,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { AuthGuard } from '../auth/guard/auth.guards';
import { Public } from '../auth/decorator/public.decorator';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@UseGuards(AuthGuard)
@Controller('payment')
@UseGuards(AuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Public()
  @Post('/collect')
  handlePayment(
    @Body(ValidationPipe)
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
}
