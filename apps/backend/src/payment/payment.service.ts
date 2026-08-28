import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { PaymentMethod, UserRole } from '@prisma/client';
import { ParishService } from '../parish/parish.service';
import {
  CreateTransactionDto,
  MassInfoDto,
  PaymentInfoDto,
} from './dto/create-transaction.dto';
import { TransactionsService } from '../transactions/transactions.service';
import { BelieverService } from '../believer/believer.service';
import { MassService } from '../mass/mass.service';
import { PrismaService } from '../prisma/prisma.service';
import { PlatformSettingsService } from '../platform-settings/platform-settings.service';
import { MassPriceService } from '../mass-price/mass-price.service';
import { CurrencyConversionService } from '../currency-conversion/currency-conversion.service';
import { resolveParishForUser } from '../common/user.utils';
import { PLATFORM_OWNER_ID } from '../common/constants';
import { PaypalService } from './paypal.service';

/** One resolved line item in a checkout — massInfo carries the client's
 * legitimate input (which mass, its intension text); total is the
 * server-computed amount for that mass (base price + platform fee). */
interface CheckoutItem {
  massInfo: MassInfoDto;
  total: number;
}

@Injectable()
export class PaymentService {
  constructor(
    private readonly parishService: ParishService,
    private readonly transactionsService: TransactionsService,
    private readonly believerService: BelieverService,
    private readonly massService: MassService,
    private readonly prismaService: PrismaService,
    private readonly platformSettingsService: PlatformSettingsService,
    private readonly massPriceService: MassPriceService,
    private readonly currencyConversionService: CurrencyConversionService,
    private readonly paypalService: PaypalService
  ) {}

  /**
   * "Collect" step — validates the checkout, creates the Believer, one
   * MassOrder per mass, and one Payment per MassOrder with status
   * INITIATED (all sharing one reference — our own, for NotchPay; PayPal's
   * order id, patched in right after createOrder returns it, since PayPal
   * doesn't take a caller-supplied order id). Only then calls the gateway,
   * and flips those rows to PENDING once the gateway has actually accepted
   * the checkout. Payment.status is the lifecycle record itself
   * (INITIATED -> PENDING -> COMPLETED/FAILED/EXPIRED/REFUNDED), so a
   * checkout that's never confirmed still leaves a real, queryable trace
   * instead of vanishing — see finalizeCheckout.
   */
  async handlePayment(handlePaymentDto: CreateTransactionDto): Promise<string> {
    const { believerInfo, massInfos, paymentInfo } = handlePaymentDto;

    const masses = await this.massService.findManyByIds(
      massInfos.map((m) => m.id)
    );
    const massById = new Map(masses.map((m) => [m.massId, m]));
    if (massInfos.some((m) => !massById.has(m.id))) {
      throw new NotFoundException('One or more masses no longer exist.');
    }

    // All masses in one checkout must belong to the same parish — the
    // ledger attribution in finalizeCheckout assumes a single owner per
    // batch.
    if (new Set(masses.map((m) => m.parishId)).size > 1) {
      throw new BadRequestException(
        'A single checkout cannot span multiple parishes.'
      );
    }

    // Re-checked here, server-side, at the moment of checkout — the
    // scheduler's sweep only flips OPEN->CLOSED once a minute, so without
    // this a checkout could still start right at that boundary. Once
    // initiated, a Mass closing underneath an in-flight gateway attempt is
    // NOT re-checked at confirmation (finalizeCheckout) — by then money
    // may have already moved, and rejecting a successful charge would be
    // worse than honoring it a few minutes late.
    if (masses.some((m) => m.status !== 'OPEN')) {
      throw new BadRequestException(
        'Ordering has closed for one or more of these masses.'
      );
    }

    // The only source of truth for what each mass costs — never trust a
    // client-submitted price (see CreateTransactionDto). The platform fee
    // is added on top; the parish's ledger share is always this exact
    // base price, in full.
    const basePriceByMassId = await this.massPriceService.resolvePrices(
      this.prismaService,
      masses,
      paymentInfo.currency
    );
    const settings = await this.platformSettingsService.get();

    const items: CheckoutItem[] = massInfos.map((massInfo) => {
      // resolvePrices resolves every mass passed to it or throws — this
      // set is exactly the masses just looked up above.
      const basePrice = basePriceByMassId.get(massInfo.id) as number;
      const fee = this.platformSettingsService.computeFee(
        settings,
        basePrice
      );
      return { massInfo, total: basePrice + fee };
    });
    const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

    // Our own reference, generated up front — passed to NotchPay directly
    // as `reference`. PayPal generates its own order id instead, so its
    // Payment rows get this overwritten right after createOrder returns
    // (see initiatePaypalCheckout).
    const reference = createId();

    const paymentIds = await this.prismaService.$transaction(async (tx) => {
      const believer = await tx.believer.create({
        data: { fullName: believerInfo.name, phone: believerInfo.phone },
      });

      const ids: string[] = [];
      for (const { massInfo, total } of items) {
        const massOrder = await tx.massOrder.create({
          data: {
            intension: massInfo.intension,
            price: total,
            currency: paymentInfo.currency,
            orderByBeliever: { connect: { believerId: believer.believerId } },
            mass: { connect: { massId: massInfo.id } },
          },
        });

        const payment = await tx.payment.create({
          data: {
            amount: total,
            paymentMethod: paymentInfo.paymentMethod,
            status: 'INITIATED',
            currency: paymentInfo.currency,
            referenceId: reference,
            believer: { connect: { believerId: believer.believerId } },
            massOrder: { connect: { massOrderId: massOrder.massOrderId } },
          },
        });
        ids.push(payment.paymentId);
      }
      return ids;
    });

    try {
      let checkoutUrl: string;
      switch (paymentInfo.paymentMethod) {
        case PaymentMethod.PAYPAL:
          checkoutUrl = await this.initiatePaypalCheckout(
            items,
            paymentInfo,
            paymentIds
          );
          break;
        case PaymentMethod.MOBILE_MONEY:
          checkoutUrl = await this.initiateNotchPayCheckout(
            paymentInfo,
            reference,
            grandTotal
          );
          break;
        default:
          throw new UnprocessableEntityException(
            `Payment method ${paymentInfo.paymentMethod} is not yet supported.`
          );
      }

      // The gateway has now actually accepted the checkout — genuinely
      // awaiting the customer's action on its side.
      await this.prismaService.payment.updateMany({
        where: { paymentId: { in: paymentIds }, status: 'INITIATED' },
        data: { status: 'PENDING' },
      });

      return checkoutUrl;
    } catch (error) {
      // The gateway rejected the checkout outright (or we refused to even
      // ask, e.g. unsupported method) — mark FAILED rather than leaving
      // these rows stuck INITIATED for a reconciliation job to eventually
      // find.
      await this.prismaService.payment.updateMany({
        where: { paymentId: { in: paymentIds }, status: 'INITIATED' },
        data: { status: 'FAILED' },
      });
      throw error;
    }
  }

  private async initiateNotchPayCheckout(
    paymentInfo: PaymentInfoDto,
    reference: string,
    amount: number
  ): Promise<string> {
    const optionPaymentInit = {
      method: 'POST',
      headers: {
        Authorization: process.env.NOTCH_PUBLIC_KEY ?? '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: paymentInfo.currency,
        description: 'Mass offering payment',
        email: 'easyMess@gmail.com',
        reference,
        callback: 'https://onlinepreps.net',
      }),
    };

    try {
      const paymentInit = await fetch(
        'https://api.notchpay.co/payments',
        optionPaymentInit
      ).then((response) => response.json());

      if (paymentInit.code === 201 && paymentInit.status === 'Accepted') {
        return paymentInit.authorization_url;
      }

      throw new UnprocessableEntityException(
        'Payment initialization was not accepted.'
      );
    } catch (error) {
      throw new UnprocessableEntityException(error);
    }
  }

  private async initiatePaypalCheckout(
    items: CheckoutItem[],
    paymentInfo: PaymentInfoDto,
    paymentIds: string[]
  ): Promise<string> {
    const appBaseUrl = process.env.APP_PUBLIC_URL;
    if (!appBaseUrl) {
      throw new UnprocessableEntityException(
        'APP_PUBLIC_URL is not configured — required to build PayPal return/cancel URLs.'
      );
    }

    const { orderId, approveUrl } = await this.paypalService.createOrder(
      items.map(({ massInfo, total }) => ({
        referenceId: massInfo.id,
        amount: total,
        currency: paymentInfo.currency,
      })),
      `${appBaseUrl}/api/payment/paypal/return`,
      `${appBaseUrl}/api/payment/paypal/cancel`
    );

    // PayPal generates its own order id — swap it in for the temporary
    // reference generated in handlePayment, since the return/webhook
    // handlers only ever get PayPal's order id back, never ours.
    await this.prismaService.payment.updateMany({
      where: { paymentId: { in: paymentIds } },
      data: { referenceId: orderId },
    });

    return approveUrl;
  }

  /**
   * Webhook handler — confirms the charge with NotchPay, then hands off to
   * finalizeCheckout to actually write the ledger.
   */
  async notifyPayment(paymentResult) {
    const {
      data: { reference },
    } = paymentResult;

    const checkPayment = {
      method: 'GET',
      headers: {
        Authorization: process.env.NOTCH_PUBLIC_KEY ?? '',
      },
    };

    const paymentStatus = await fetch(
      `https://api.notchpay.co/payments/${reference}`,
      checkPayment
    ).then((response) => response.json());

    const gatewayStatus = paymentStatus?.transaction?.status;

    // NotchPay's transaction.status: pending/processing/complete/failed/
    // canceled/expired — only 'complete' means money actually moved.
    if (gatewayStatus !== 'complete') {
      // A terminal negative status: mark FAILED now rather than leaving it
      // for a reconciliation job. 'pending'/'processing' aren't terminal —
      // leave PENDING so a retried webhook delivery can still complete it.
      if (['failed', 'canceled', 'expired'].includes(gatewayStatus)) {
        await this.prismaService.payment.updateMany({
          where: { referenceId: reference, status: 'PENDING' },
          data: { status: 'FAILED' },
        });
      }
      return {
        code: 200,
        message: `Payment not complete (status: ${gatewayStatus}); ignoring.`,
      };
    }

    return this.finalizeCheckout(reference);
  }

  /**
   * Hit by the customer's browser after approving the charge on PayPal's
   * site (application_context.return_url from initiatePaypalCheckout) —
   * no session/JWT available here, PayPal drives this redirect directly.
   * Captures the order, then hands off to finalizeCheckout. Also called
   * from handlePaypalWebhook as a durability backstop.
   */
  async handlePaypalReturn(orderId: string) {
    // Idempotent on PayPal's side — capturing an already-captured order
    // returns the existing capture instead of double-charging, so this is
    // safe to call from both the return handler and the webhook.
    const capture = await this.paypalService.captureOrder(orderId);
    if (capture.status !== 'COMPLETED') {
      await this.prismaService.payment.updateMany({
        where: { referenceId: orderId, status: 'PENDING' },
        data: { status: 'FAILED' },
      });
      return {
        code: 200,
        message: `PayPal order not completed (status: ${capture.status}).`,
      };
    }

    return this.finalizeCheckout(orderId);
  }

  /** Customer backed out on PayPal's approval page. */
  async handlePaypalCancel(orderId: string) {
    await this.prismaService.payment.updateMany({
      where: { referenceId: orderId, status: 'PENDING' },
      data: { status: 'FAILED' },
    });
    return { code: 200, message: 'Checkout cancelled.' };
  }

  /** Durability backstop for handlePaypalReturn — covers a customer
   * closing the tab right after approving, before the return redirect
   * completes. Must verify the signature itself: this endpoint is
   * necessarily @Public() (PayPal calls it server-to-server), so signature
   * verification is what stands in for auth here. */
  async handlePaypalWebhook(
    headers: Record<string, string | undefined>,
    event: { event_type?: string; resource?: { id?: string } }
  ) {
    const verified = await this.paypalService.verifyWebhookSignature(
      headers,
      event
    );
    if (!verified) {
      throw new UnprocessableEntityException(
        'Invalid PayPal webhook signature.'
      );
    }

    // Fires as soon as the customer approves, before capture — resource IS
    // the order object, so resource.id is the order id finalizeCheckout
    // needs, same as the return handler's `token` query param.
    if (event.event_type !== 'CHECKOUT.ORDER.APPROVED') {
      return { code: 200, message: 'Ignored event type.' };
    }

    const orderId = event.resource?.id;
    if (!orderId) {
      return { code: 200, message: 'Malformed event: no order id.' };
    }

    return this.handlePaypalReturn(orderId);
  }

  /**
   * Flips every PENDING Payment sharing `reference` to COMPLETED and writes
   * the income/platform-fee ledger split for each. Believer/MassOrder/
   * Payment already exist (created in handlePayment) — this only runs once
   * the gateway has confirmed the charge.
   *
   * The conditional updateMany (status: 'PENDING' in the where clause) is
   * the idempotency guard: only rows still PENDING get flipped, and
   * `count` tells us whether *this* call is the one that won the race —
   * a retried NotchPay webhook, or PayPal's return-redirect and webhook
   * both firing for the same order, becomes a safe no-op on the loser.
   */
  private async finalizeCheckout(reference: string) {
    // Peek at the payment currency and fetch its rate to BASE_CURRENCY
    // (XAF) BEFORE opening the transaction below — Transaction has no
    // currency column, so every ledger amount must already be in XAF
    // regardless of what currency the believer actually paid in. Doing
    // the (possibly network-bound) rate lookup up front means a hiccup on
    // that external call fails fast and lets the caller (webhook/return
    // handler) retry cleanly, instead of forcing a rollback of the
    // COMPLETED status flip that's about to happen inside the transaction
    // — the charge has already succeeded on the gateway by this point.
    const sample = await this.prismaService.payment.findFirst({
      where: { referenceId: reference },
      select: { currency: true },
    });
    if (!sample) {
      return { code: 200, message: 'Already processed or unknown reference.' };
    }
    const rateToBaseCurrency =
      await this.currencyConversionService.getRateToBaseCurrency(
        sample.currency
      );

    // Runs at SERIALIZABLE isolation (see PrismaService.runSerializableTransaction)
    // so a concurrent payment/withdrawal/refund touching the same parish or
    // platform balance can't produce a lost update — Postgres aborts one
    // side with a retryable conflict instead.
    return this.prismaService.runSerializableTransaction(async (tx) => {
      const { count } = await tx.payment.updateMany({
        where: { referenceId: reference, status: 'PENDING' },
        data: { status: 'COMPLETED', paidAt: new Date() },
      });
      if (count === 0) {
        return { code: 200, message: 'Already processed.' };
      }

      const payments = await tx.payment.findMany({
        where: { referenceId: reference },
        include: { massOrder: { include: { mass: true } } },
      });

      const parishId = payments[0].massOrder.mass.parishId;

      let parishBalance = await this.transactionsService.getCurrentBalance(
        tx,
        parishId,
        'PARISH'
      );
      let platformBalance = await this.transactionsService.getCurrentBalance(
        tx,
        PLATFORM_OWNER_ID,
        'ADMIN'
      );

      for (const payment of payments) {
        // The parish's ledger share is always exactly the mass's own
        // base-currency price — set by the parish, read fresh, never
        // converted or re-derived through a currency-specific MassPrice
        // override (that override only affects what the believer was
        // actually charged, not what the parish is owed).
        const parishShare = payment.massOrder.mass.price;

        // The platform's fee is defined as a REMAINDER — whatever was
        // actually charged (payment.amount, in the currency the believer
        // paid in), converted to BASE_CURRENCY, minus the parish's fixed
        // share. This guarantees parishShare + platformFee always equals
        // exactly what was collected, with nothing left unaccounted for —
        // even across FX-rate drift between initiation and confirmation,
        // or a MassPrice that wasn't set as a strict conversion of
        // Mass.price. Independently recomputing a percentage+fixed fee
        // and converting both halves separately (the previous approach)
        // could leave a gap between the two; this can't.
        const totalInBaseCurrency = payment.amount * rateToBaseCurrency;
        const platformFee = totalInBaseCurrency - parishShare;

        ({ balanceAfter: parishBalance } =
          await this.transactionsService.createAtBalance(
            tx,
            {
              transactionType: 'INCOME',
              ownerId: parishId,
              ownerType: 'PARISH',
              amount: parishShare,
              payment: { connect: { paymentId: payment.paymentId } },
            },
            parishBalance
          ));

        ({ balanceAfter: platformBalance } =
          await this.transactionsService.createAtBalance(
            tx,
            {
              transactionType: 'PLATFORM_FEE',
              ownerId: PLATFORM_OWNER_ID,
              ownerType: 'ADMIN',
              amount: platformFee,
              payment: { connect: { paymentId: payment.paymentId } },
            },
            platformBalance
          ));
      }

      return { code: 200, message: 'Bill of masses ordered' };
    });
  }

  /** Parish-only — there's no priest balance to withdraw from in this MVP.
   * Uses the parish's persisted payoutNumber (set via
   * PATCH /parishes/:id/payout-method) rather than trusting a client-
   * supplied number on every call. */
  async withdrawMoney(
    requestUser: { id: string; role: UserRole },
    amount: number
  ) {
    const parish = await resolveParishForUser(
      this.prismaService,
      requestUser.id
    );

    if (parish.payoutBlocked) {
      throw new ForbiddenException('Forbidden', {
        cause: new Error(),
        description: 'Payouts are currently blocked for this parish.',
      });
    }

    if (!parish.payoutNumber) {
      throw new BadRequestException('Bad Request', {
        cause: new Error(),
        description:
          'No payout number on file. Set one via PATCH /parishes/:id/payout-method first.',
      });
    }

    const recipientId = await this.createOrRetreiveRecipient(
      parish.parishId,
      parish.payoutNumber
    );

    const optionWithdrawMoney = {
      method: 'POST',
      headers: {
        Authorization: process.env.NOTCH_PUBLIC_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'XAF',
        description: 'Cash out parish money',
        reference: recipientId,
      }),
    };

    try {
      const withdrawalData = await fetch(
        'https://api.notchpay.co/transfers',
        optionWithdrawMoney
      ).then((response) => response.json());

      if (withdrawalData.code === 201 && withdrawalData.status === 'Accepted') {
        // Serializable so a withdrawal racing with a concurrent payment/
        // refund for the same parish can't produce a lost update on the
        // running balance (see PrismaService.runSerializableTransaction).
        await this.prismaService.runSerializableTransaction((tx) =>
          this.transactionsService.createWithBalance(tx, {
            transactionType: 'WITHDRAWAL',
            ownerId: parish.parishId,
            ownerType: 'PARISH',
            amount: -Math.abs(withdrawalData.transfer.amount_total),
            externalPayoutId: withdrawalData.transfer.reference,
            createdByUser: { connect: { userId: requestUser.id } },
          })
        );

        return { code: 201, message: 'Payment initiated successfully' };
      }

      throw new UnprocessableEntityException('Withdrawal was not accepted.');
    } catch (error) {
      throw new UnprocessableEntityException(error);
    }
  }

  async createOrRetreiveRecipient(
    parishId: string,
    payoutNumber: string
  ): Promise<string> {
    const referenceId = createId();

    const parish = await this.parishService.findParish(parishId);

    if (parish?.receiverId) {
      return parish.receiverId;
    }

    const optionCreateRecipient = {
      method: 'POST',
      headers: {
        Authorization: process.env.NOTCH_PUBLIC_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: 'cm.mobile',
        number: payoutNumber,
        phone: parish?.phone,
        email: 'easyMess@gmail.com',
        country: 'CM',
        name: parish?.name,
        description: 'Cash out parish money',
        reference: referenceId,
      }),
    };

    try {
      const createRecipient = await fetch(
        'https://api.notchpay.co/recipients',
        optionCreateRecipient
      ).then((response) => response.json());

      if (createRecipient.code === 200) {
        // Internal update — this is a system-derived cache of the NotchPay
        // recipient id, not a user-initiated edit, so no requestUser/
        // ownership check applies here.
        await this.parishService.update(parishId, { receiverId: referenceId });
        return referenceId;
      }

      throw new UnprocessableEntityException(
        'Failed to create payout recipient.'
      );
    } catch (error) {
      throw new UnprocessableEntityException(error);
    }
  }

  /**
   * Admin-only. NotchPay has no refund API (verified against their public
   * docs), so this doesn't call out to them — it assumes the money was
   * already returned to the believer outside the platform (manually, or via
   * NotchPay support) and reverses our internal ledger to match: marks the
   * Payment REFUNDED and writes one INCOME_REVERSAL per original split row.
   */
  async refundPayment(paymentId: string, requestUser: { id: string }) {
    const payment = await this.prismaService.payment.findUnique({
      where: { paymentId },
      include: { transactions: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status === 'REFUNDED') {
      throw new BadRequestException('Payment already refunded');
    }

    const reversibleRows = payment.transactions.filter((t) =>
      ['INCOME', 'PLATFORM_FEE'].includes(t.transactionType)
    );

    // Serializable (see PrismaService.runSerializableTransaction) so a
    // refund racing with a concurrent payment/withdrawal for the same
    // owner can't produce a lost update. Starting balances are cached
    // per (ownerId, ownerType) as they're encountered, instead of one
    // query per reversed row — the same pattern notifyPayment uses,
    // reintroduced here after a review found this loop had regressed to
    // the per-row query it was meant to avoid.
    return this.prismaService.runSerializableTransaction(async (tx) => {
      const balanceCache = new Map<string, number>();

      for (const row of reversibleRows) {
        const cacheKey = `${row.ownerType}:${row.ownerId}`;
        const previousBalance =
          balanceCache.get(cacheKey) ??
          (await this.transactionsService.getCurrentBalance(
            tx,
            row.ownerId,
            row.ownerType
          ));

        const { balanceAfter } = await this.transactionsService.createAtBalance(
          tx,
          {
            transactionType: 'INCOME_REVERSAL',
            ownerId: row.ownerId,
            ownerType: row.ownerType,
            amount: -row.amount,
            payment: { connect: { paymentId } },
            createdByUser: { connect: { userId: requestUser.id } },
            note: `Reversal of ${row.transactionType} ${row.transactionId}`,
          },
          previousBalance
        );
        balanceCache.set(cacheKey, balanceAfter);
      }

      await tx.payment.update({
        where: { paymentId },
        data: { status: 'REFUNDED' },
      });

      return { code: 200, message: 'Payment refunded and ledger reversed.' };
    });
  }
}
