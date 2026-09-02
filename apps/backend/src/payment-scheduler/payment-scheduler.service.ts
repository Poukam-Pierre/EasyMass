import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaymentService } from '../payment/payment.service';

/** How many pending payments get reconciled against NotchPay concurrently
 * per tick — bounded so a large backlog doesn't fire off unbounded parallel
 * requests to NotchPay's API at once, while still not serializing the whole
 * batch. */
const RECONCILE_CONCURRENCY = 5;

@Injectable()
export class PaymentSchedulerService {
  private readonly logger = new Logger(PaymentSchedulerService.name);

  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Fallback for a NotchPay webhook that's missed, delayed, or never
   * configured: every minute, re-checks every mobile-money Payment still
   * PENDING against NotchPay directly, via the same reconciliation
   * reachable from the webhook handler (reconcileNotchPayPayment) — so a
   * payment only ever gets written to the DB once its status has actually
   * moved to something terminal (complete/failed/canceled/expired).
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async reconcilePendingPayments() {
    const references = await this.paymentService.findPendingMobileMoneyReferences();
    if (references.length === 0) return;

    this.logger.log(`Reconciling ${references.length} pending mobile-money payment(s).`);

    for (let i = 0; i < references.length; i += RECONCILE_CONCURRENCY) {
      const batch = references.slice(i, i + RECONCILE_CONCURRENCY);
      await Promise.all(batch.map((reference) => this.reconcileOne(reference)));
    }
  }

  private async reconcileOne(reference: string) {
    try {
      await this.paymentService.reconcileNotchPayPayment(reference);
    } catch (error) {
      this.logger.error(
        `Failed to reconcile pending payment ${reference}: ${error?.message ?? error}`
      );
    }
  }
}
