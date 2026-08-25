import { Body, Controller, Param, Post, Request } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PaymentService } from './payment.service';
import { Public } from '../auth/decorator/public.decorator';
import { Roles } from '../auth/decorator/roles.decorator';
import { AuthenticatedRequest } from '../common/authenticated-request';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { WithdrawMoneyDto } from './dto/withdraw-money.dto';

@Controller('payment')
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

  // Public because NotchPay calls this server-to-server (no user session to
  // attach a JWT to). Integrity instead relies on re-fetching the payment
  // status directly from NotchPay inside notifyPayment rather than trusting
  // this request body at face value.
  @Public()
  @Post('/notifications')
  notifyPayment(
    @Body()
    paymentResult
  ) {
    return this.paymentService.notifyPayment(paymentResult);
  }

  @Post('/withdraw')
  @Roles(UserRole.PARISH)
  withdrawMoney(
    @Request() request: AuthenticatedRequest,
    @Body() dto: WithdrawMoneyDto
  ) {
    return this.paymentService.withdrawMoney(request.user, dto.amount);
  }

  @Post('/:paymentId/refund')
  @Roles(UserRole.ADMIN)
  refundPayment(
    @Param('paymentId') paymentId: string,
    @Request() request: AuthenticatedRequest
  ) {
    return this.paymentService.refundPayment(paymentId, request.user);
  }
}
