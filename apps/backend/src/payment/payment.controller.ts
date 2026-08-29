import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Request,
  Res,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Response } from 'express';
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

  // Public: PayPal redirects the customer's browser here directly after
  // approval (application_context.return_url), no session to attach a JWT
  // to. `token` is PayPal's own query param name for the order id.
  @Public()
  @Get('/paypal/return')
  async paypalReturn(
    @Query('token') orderId: string,
    @Res() res: Response
  ) {
    const result = await this.paymentService.handlePaypalReturn(orderId);
    this.respondToPaypalRedirect(res, result);
  }

  @Public()
  @Get('/paypal/cancel')
  async paypalCancel(@Query('token') orderId: string, @Res() res: Response) {
    const result = await this.paymentService.handlePaypalCancel(orderId);
    this.respondToPaypalRedirect(res, result);
  }

  // Public: PayPal calls this server-to-server. Integrity relies on
  // handlePaypalWebhook verifying the signature, not on this route being
  // unguessable.
  @Public()
  @Post('/paypal/webhook')
  paypalWebhook(
    @Headers() headers: Record<string, string>,
    @Body() event
  ) {
    return this.paymentService.handlePaypalWebhook(headers, event);
  }

  /** No real checkout frontend is wired up yet (see
   * apps/easy-messe/components/OfferMass/ModalPayment.tsx — its confirm
   * button isn't connected to anything), so this redirects only if
   * FRONTEND_CHECKOUT_RETURN_URL is set; otherwise it falls back to a
   * plain JSON body so the flow is still testable end-to-end today. */
  private respondToPaypalRedirect(
    res: Response,
    result: { code: number; message: string }
  ) {
    const redirectBase = process.env.FRONTEND_CHECKOUT_RETURN_URL;
    if (redirectBase) {
      res.redirect(`${redirectBase}?message=${encodeURIComponent(result.message)}`);
      return;
    }
    res.status(result.code).json(result);
  }

  // Public: this is the link texted to mobile-money payers (see
  // PaymentService.sendInvoice) — no session to attach a JWT to, since it's
  // opened directly from an SMS. Security relies on `reference` being an
  // unguessable token (NotchPay's own reference / PayPal's order id), the
  // same model Stripe/PayPal use for their own checkout confirmation pages.
  @Public()
  @Get('/:reference/invoice')
  async downloadInvoice(
    @Param('reference') reference: string,
    @Res() res: Response
  ) {
    const pdf = await this.paymentService.getInvoicePdf(reference);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="invoice-${reference}.pdf"`,
    });
    res.send(pdf);
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
