import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaymentMethod } from '@prisma/client';
import { PaymentService } from '../payment/payment.service';

/** How many pending payments get reconciled against the gateway concurrently
 * per tick — bounded so a large backlog doesn't fire off unbounded parallel
 * requests at once, while still not serializing the whole batch. */
const RECONCILE_CONCURRENCY = 5;

@Injectable()
export class PaymentSchedulerService {
  private readonly logger = new Logger(PaymentSchedulerService.name);

  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Fallback for a gateway webhook that's missed, delayed, or never
   * configured: every minute, re-checks every Payment still PENDING against
   * its own gateway directly — NotchPay references via
   * reconcileNotchPayPayment, PayPal order ids via reconcilePaypalPayment —
   * so a payment only ever gets written to the DB once its status has
   * actually moved to something terminal.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async reconcilePendingPayments() {
    await this.reconcileBatch(
      PaymentMethod.MOBILE_MONEY,
      (reference) => this.paymentService.reconcileNotchPayPayment(reference)
    );
    await this.reconcileBatch(
      PaymentMethod.PAYPAL,
      (orderId) => this.paymentService.reconcilePaypalPayment(orderId)
    );
  }

  private async reconcileBatch(
    paymentMethod: PaymentMethod,
    reconcileOne: (reference: string) => Promise<unknown>
  ) {
    const references = await this.paymentService.findPendingReferences(
      paymentMethod
    );
    if (references.length === 0) return;

    this.logger.log(
      `Reconciling ${references.length} pending ${paymentMethod} payment(s).`
    );

    for (let i = 0; i < references.length; i += RECONCILE_CONCURRENCY) {
      const batch = references.slice(i, i + RECONCILE_CONCURRENCY);
      await Promise.all(
        batch.map((reference) =>
          reconcileOne(reference).catch((error) =>
            this.logger.error(
              `Failed to reconcile pending payment ${reference}: ${error?.message ?? error}`
            )
          )
        )
      );
    }
  }
}
