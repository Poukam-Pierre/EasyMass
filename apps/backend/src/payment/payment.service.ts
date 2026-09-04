import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import {
  Currency,
  PaymentAudiAction,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  UserRole,
} from '@prisma/client';
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
import { SmsService } from '../sms/sms.service';
import { MailService } from '../mail/mail.service';
import { InvoiceDetails, PdfService } from '../pdf/pdf.service';

type InvoicePayments = Prisma.PaymentGetPayload<{
  include: {
    believer: true;
    massOrder: { include: { mass: { include: { parish: true } } } };
  };
}>[];

/** One resolved line item in a checkout — massInfo carries the client's
 * legitimate input (which mass, its intension text); total is the
 * server-computed amount for that mass (base price + platform fee). */
interface CheckoutItem {
  massInfo: MassInfoDto;
  total: number;
}

/** One mass's resolved pricing in a given currency — shared shape between
 * the real checkout (handlePayment) and the read-only preview
 * (previewCheckout). */
interface PricedMassItem {
  massId: string;
  basePrice: number;
  fee: number;
  total: number;
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly parishService: ParishService,
    private readonly transactionsService: TransactionsService,
    private readonly believerService: BelieverService,
    private readonly massService: MassService,
    private readonly prismaService: PrismaService,
    private readonly platformSettingsService: PlatformSettingsService,
    private readonly massPriceService: MassPriceService,
    private readonly currencyConversionService: CurrencyConversionService,
    private readonly paypalService: PaypalService,
    private readonly smsService: SmsService,
    private readonly mailService: MailService,
    private readonly pdfService: PdfService
  ) {}

  /** One PaymentAudit row per paymentId, recording the status it just
   * moved to. changedByUserId is null for every gateway/system-driven
   * transition (checkout creation, webhook confirmation, the
   * reconciliation cron) — only withdraw/refund have a real actor to
   * attribute (see refundPayment). Accepts either the plain PrismaService
   * or a transaction client so callers already inside a $transaction can
   * write the audit atomically with the status change itself. */
  private async recordPaymentAudits(
    client: PrismaService | Prisma.TransactionClient,
    paymentIds: string[],
    status: PaymentStatus,
    action: PaymentAudiAction,
    changedByUserId: string | null = null
  ) {
    if (paymentIds.length === 0) return;
    await client.paymentAudit.createMany({
      data: paymentIds.map((paymentId) => ({
        paymentId,
        status,
        paymentAudiAction: action,
        changedByUserId,
      })),
    });
  }

  /** Looks up which Payments sharing `referenceId` are currently in
   * `status`, for audit purposes right after an updateMany — Prisma's
   * updateMany only returns a count, not the affected rows' ids. */
  private async findPaymentIdsByReference(
    referenceId: string,
    status: PaymentStatus
  ): Promise<string[]> {
    const rows = await this.prismaService.payment.findMany({
      where: { referenceId, status },
      select: { paymentId: true },
    });
    return rows.map((r) => r.paymentId);
  }

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

    const { pricedItems, grandTotal } = await this.resolveCheckoutPricing(
      massInfos.map((m) => m.id),
      paymentInfo.currency
    );
    const items: CheckoutItem[] = massInfos.map((massInfo, index) => ({
      massInfo,
      total: pricedItems[index].total,
    }));

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
            anonymous: massInfo.anonymous ?? false,
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

      await this.recordPaymentAudits(
        tx,
        ids,
        PaymentStatus.INITIATED,
        PaymentAudiAction.CREATED
      );

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
            grandTotal,
            paymentIds
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
      await this.recordPaymentAudits(
        this.prismaService,
        paymentIds,
        PaymentStatus.PENDING,
        PaymentAudiAction.UPDATED
      );

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
      await this.recordPaymentAudits(
        this.prismaService,
        paymentIds,
        PaymentStatus.FAILED,
        PaymentAudiAction.UPDATED
      );
      throw error;
    }
  }

  /**
   * Shared by handlePayment (real checkout) and previewCheckout (read-only,
   * no side effects) — validates the mass batch and resolves each mass's
   * price + platform fee in the requested currency. Never trust a client-
   * submitted price (see CreateTransactionDto): MassPrice/Mass.price is the
   * only source of truth for what a mass costs, and PlatformSettings for
   * that same currency is the only source of truth for the fee — both
   * already in `currency`, so no FX conversion happens here.
   */
  private async resolveCheckoutPricing(
    massIds: string[],
    currency: Currency
  ): Promise<{ pricedItems: PricedMassItem[]; grandTotal: number }> {
    const masses = await this.massService.findManyByIds(massIds);
    const massById = new Map(masses.map((m) => [m.massId, m]));
    if (massIds.some((id) => !massById.has(id))) {
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

    // Re-checked here, server-side, at the moment of pricing — the
    // scheduler's sweep only flips OPEN->CLOSED once a minute, so without
    // this a checkout (or its preview) could still start right at that
    // boundary. Once initiated, a Mass closing underneath an in-flight
    // gateway attempt is NOT re-checked at confirmation (finalizeCheckout)
    // — by then money may have already moved, and rejecting a successful
    // charge would be worse than honoring it a few minutes late.
    if (masses.some((m) => m.status !== 'OPEN')) {
      throw new BadRequestException(
        'Ordering has closed for one or more of these masses.'
      );
    }

    const basePriceByMassId = await this.massPriceService.resolvePrices(
      this.prismaService,
      masses,
      currency
    );
    const settings = await this.platformSettingsService.getForCurrency(
      currency
    );
    if (!settings) {
      throw new UnprocessableEntityException(
        'platformFeeNotConfiguredForCurrency',
        {
          cause: new Error(),
          description: `No platform fee configuration exists for ${currency}.`,
        }
      );
    }

    const pricedItems: PricedMassItem[] = massIds.map((massId) => {
      // resolvePrices resolves every mass passed to it or throws — this
      // set is exactly the masses just looked up above.
      const basePrice = basePriceByMassId.get(massId) as number;
      const fee = this.platformSettingsService.computeFee(settings, basePrice);
      return { massId, basePrice, fee, total: basePrice + fee };
    });
    const grandTotal = pricedItems.reduce((sum, item) => sum + item.total, 0);

    return { pricedItems, grandTotal };
  }

  /** Read-only price preview — no Believer/MassOrder/Payment rows, no
   * gateway call. Lets the frontend show a "friendly UI price" in the
   * payer's chosen currency before they commit to a PayPal/mobile-money
   * request, using the exact same pricing logic the real checkout uses so
   * the preview always matches what gets charged (and later invoiced). */
  async previewCheckout(
    massIds: string[],
    currency: Currency
  ): Promise<{
    items: PricedMassItem[];
    grandTotal: number;
    currency: Currency;
  }> {
    const { pricedItems, grandTotal } = await this.resolveCheckoutPricing(
      massIds,
      currency
    );
    return { items: pricedItems, grandTotal, currency };
  }

  private async initiateNotchPayCheckout(
    paymentInfo: PaymentInfoDto,
    reference: string,
    amount: number,
    paymentIds: string[]
  ): Promise<string> {
    const callbackUrl = process.env.FRONTEND_CHECKOUT_RETURN_URL;
    if (!callbackUrl) {
      throw new UnprocessableEntityException(
        'FRONTEND_CHECKOUT_RETURN_URL is not configured — required to build the NotchPay callback URL.'
      );
    }

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
        email: 'poukamtech@gmail.com',
        reference,
        callback: callbackUrl,
      }),
    };

    try {
      const paymentInit = await fetch(
        'https://api.notchpay.co/payments',
        optionPaymentInit
      ).then((response) => response.json());

      if (paymentInit.code === 201 && paymentInit.status === 'Accepted') {
        // NotchPay assigns its own transaction reference (e.g.
        // "trx.xxx"), distinct from the `reference` we sent (which comes
        // back as transaction.merchant_reference/trxref instead). Both the
        // webhook and GET /payments/:reference only resolve against
        // NotchPay's own reference — swap it in for the temporary one
        // generated in handlePayment, same as initiatePaypalCheckout does
        // for PayPal's order id.
        await this.prismaService.payment.updateMany({
          where: { paymentId: { in: paymentIds } },
          data: { referenceId: paymentInit.transaction.reference },
        });
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
    const appBaseUrl = process.env.APP_PUBLIC_URL?.replace(/\/+$/, '');
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

    return this.reconcileNotchPayPayment(reference);
  }

  /**
   * Re-checks one NotchPay payment's current status and, only if it has
   * moved to a terminal state since we last recorded it, updates the DB —
   * 'complete' finalizes the checkout (ledger + MassOrder/Mass side
   * effects), 'failed'/'canceled'/'expired' marks the Payment FAILED.
   * 'pending'/'processing' are left untouched: not yet terminal, so there's
   * nothing to reconcile. Shared by the webhook handler (notifyPayment,
   * reacting to one delivery) and PaymentSchedulerService's cron sweep
   * (reconciling every still-PENDING mobile-money payment as a fallback for
   * a webhook that was missed or never configured).
   */
  async reconcileNotchPayPayment(reference: string) {
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
      // A terminal negative status: mark FAILED now. 'pending'/'processing'
      // aren't terminal — leave PENDING so a later check (retried webhook
      // delivery, or the next cron sweep) can still complete it.
      if (['failed', 'canceled', 'expired'].includes(gatewayStatus)) {
        const { count } = await this.prismaService.payment.updateMany({
          where: { referenceId: reference, status: 'PENDING' },
          data: { status: 'FAILED' },
        });
        if (count > 0) {
          const paymentIds = await this.findPaymentIdsByReference(
            reference,
            PaymentStatus.FAILED
          );
          await this.recordPaymentAudits(
            this.prismaService,
            paymentIds,
            PaymentStatus.FAILED,
            PaymentAudiAction.UPDATED
          );
        }
      }
      return {
        code: 200,
        message: `Payment not complete (status: ${gatewayStatus}); ignoring.`,
      };
    }

    return this.finalizeCheckout(reference);
  }

  /**
   * Re-checks one PayPal order's current status and, only if it's reached a
   * terminal state since we last recorded it, resolves it — the PayPal
   * counterpart to reconcileNotchPayPayment, filling the same durability gap
   * mobile money already had a cron backstop for (see
   * PaymentSchedulerService): a customer who closed the tab before the
   * return redirect completed, whose webhook was also missed or never
   * configured, otherwise leaves that Payment stuck PENDING forever even
   * though PayPal already captured the charge.
   *
   * PayPal orders have no 'pending'/'processing' distinct from "not yet
   * approved" — CREATED/SAVED/PAYER_ACTION_REQUIRED all just mean the
   * customer hasn't finished approving on PayPal's side yet, so those are
   * left untouched. APPROVED/COMPLETED delegate to handlePaypalReturn, which
   * already does the capture-then-finalize dance (capture is idempotent, so
   * this is safe even if the return/webhook handler is racing this same
   * call). VOIDED is the one terminal-negative status, handled the same way
   * failPendingPaymentsByReference already handles a cancelled checkout.
   */
  async reconcilePaypalPayment(orderId: string) {
    const order = await this.paypalService.getOrderStatus(orderId);
    const status = order?.status;

    if (status === 'VOIDED') {
      await this.failPendingPaymentsByReference(orderId);
      return {
        code: 200,
        message: `PayPal order not completed (status: ${status}).`,
      };
    }

    if (status !== 'APPROVED' && status !== 'COMPLETED') {
      return {
        code: 200,
        message: `PayPal order not yet approved (status: ${status}); ignoring.`,
      };
    }

    return this.handlePaypalReturn(orderId);
  }

  /** referenceId of every Payment of the given method still awaiting a
   * terminal status — the working set for PaymentSchedulerService's cron
   * sweep, shared by both the mobile-money (NotchPay reference) and PayPal
   * (order id) reconciliation passes. */
  async findPendingReferences(paymentMethod: PaymentMethod): Promise<string[]> {
    const pending = await this.prismaService.payment.findMany({
      where: { status: 'PENDING', paymentMethod },
      select: { referenceId: true },
    });
    return pending
      .map((p) => p.referenceId)
      .filter((referenceId): referenceId is string => !!referenceId);
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
      await this.failPendingPaymentsByReference(orderId);
      return {
        code: 200,
        message: `PayPal order not completed (status: ${capture.status}).`,
      };
    }

    return this.finalizeCheckout(orderId);
  }

  /** Customer backed out on PayPal's approval page. */
  async handlePaypalCancel(orderId: string) {
    await this.failPendingPaymentsByReference(orderId);
    return { code: 200, message: 'Checkout cancelled.' };
  }

  /** Shared by handlePaypalReturn (order not completed) and
   * handlePaypalCancel (customer backed out) — flips every still-PENDING
   * Payment sharing `referenceId` to FAILED and audits the change. */
  private async failPendingPaymentsByReference(referenceId: string) {
    const { count } = await this.prismaService.payment.updateMany({
      where: { referenceId, status: 'PENDING' },
      data: { status: 'FAILED' },
    });
    if (count === 0) return;

    const paymentIds = await this.findPaymentIdsByReference(
      referenceId,
      PaymentStatus.FAILED
    );
    await this.recordPaymentAudits(
      this.prismaService,
      paymentIds,
      PaymentStatus.FAILED,
      PaymentAudiAction.UPDATED
    );
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
    const result = await this.prismaService.runSerializableTransaction(async (tx) => {
      const { count } = await tx.payment.updateMany({
        where: { referenceId: reference, status: 'PENDING' },
        data: { status: 'COMPLETED', paidAt: new Date() },
      });
      if (count === 0) {
        return { code: 200, message: 'Already processed.', payments: null };
      }

      const payments = await tx.payment.findMany({
        where: { referenceId: reference },
        include: {
          believer: true,
          massOrder: { include: { mass: { include: { parish: true } } } },
        },
      });

      await this.recordPaymentAudits(
        tx,
        payments.map((p) => p.paymentId),
        PaymentStatus.COMPLETED,
        PaymentAudiAction.SETTLED
      );

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

      return { code: 200, message: 'Bill of masses ordered', payments };
    });

    // Outside the transaction and awaited-but-caught: an SMS/email hiccup
    // must never roll back a payment that already succeeded on the
    // gateway, but this is called from server-to-server webhook handlers
    // and the cron sweep (never a waiting browser request), so there's no
    // reason to leave it as an un-awaited orphaned promise either.
    if (result.payments) {
      try {
        await this.sendInvoice(reference, result.payments);
      } catch (error) {
        this.logger.error(
          `Failed to send invoice for ${reference}: ${error?.message ?? error}`
        );
      }
    }

    return { code: result.code, message: result.message };
  }

  private buildInvoiceDetails(
    reference: string,
    payments: InvoicePayments
  ): InvoiceDetails {
    return {
      believerName: payments[0].believer.fullName,
      reference,
      paidAt: payments[0].paidAt ?? new Date(),
      lines: payments.map((p) => ({
        parishName: p.massOrder.mass.parish.name,
        massDate: p.massOrder.mass.startAt,
        intension: p.massOrder.intension,
        amount: p.amount,
        currency: p.currency,
      })),
    };
  }

  /** Dispatches the paid-checkout notification on the channel matching how
   * they paid: MOBILE_MONEY payers always have a phone (required at
   * checkout) so they get an SMS pointing at getInvoicePdf's download
   * link — a real PDF wouldn't fit in a text message, and a link is also
   * the one thing that survives them leaving the page before the gateway
   * confirms. PAYPAL payers get the same PDF emailed directly as an
   * attachment instead, if they gave an email (optional — silently skipped
   * if absent, since a missing email must never be treated as a failure). */
  private async sendInvoice(reference: string, payments: InvoicePayments) {
    const believer = payments[0].believer;
    const paymentMethod = payments[0].paymentMethod;

    if (paymentMethod === PaymentMethod.MOBILE_MONEY) {
      if (!believer.phone) return;
      const appBaseUrl = process.env.APP_PUBLIC_URL?.replace(/\/+$/, '');
      if (!appBaseUrl) {
        this.logger.error(
          'APP_PUBLIC_URL is not configured — cannot build the invoice download link for SMS.'
        );
        return;
      }
      await this.smsService.send(
        believer.phone,
        `EasyMesse: your payment was received. Download your receipt here: ${appBaseUrl}/api/payment/${reference}/invoice`
      );
      return;
    }

    if (paymentMethod === PaymentMethod.PAYPAL) {
      if (!believer.email) return;
      const pdf = await this.pdfService.generateInvoicePdf(
        this.buildInvoiceDetails(reference, payments)
      );
      await this.mailService.sendWithAttachment(
        believer.email,
        'Your EasyMesse payment receipt',
        `Thank you for your payment. Your receipt for ${payments.length} mass(es) is attached.`,
        { filename: `invoice-${reference}.pdf`, content: pdf }
      );
    }
  }

  /** Backs the public GET /payment/:reference/invoice download link — the
   * one sent by SMS to mobile-money payers, and usable as a "view online"
   * fallback for anyone else who has the reference. Regenerated on demand
   * rather than stored anywhere: invoice data is immutable once a Payment
   * is COMPLETED, so re-rendering is always correct and needs no file
   * storage. Only ever exposes a checkout that's actually COMPLETED — a
   * PENDING/FAILED reference has nothing to show yet. */
  async getInvoicePdf(reference: string): Promise<Buffer> {
    const payments = await this.prismaService.payment.findMany({
      where: { referenceId: reference, status: 'COMPLETED' },
      include: {
        believer: true,
        massOrder: { include: { mass: { include: { parish: true } } } },
      },
    });
    if (payments.length === 0) {
      throw new NotFoundException(
        'No completed payment found for this reference.'
      );
    }
    return this.pdfService.generateInvoicePdf(
      this.buildInvoiceDetails(reference, payments)
    );
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
      throw new ForbiddenException('withdrawalBlocked', {
        cause: new Error(),
        description: 'Payouts are currently blocked for this parish.',
      });
    }

    if (!parish.payoutNumber) {
      throw new BadRequestException('withdrawalNoPayoutNumber', {
        cause: new Error(),
        description:
          'No payout number on file. Set one via PATCH /parishes/:id/payout-method first.',
      });
    }

    const currentBalance = await this.transactionsService.getCurrentBalance(
      this.prismaService,
      parish.parishId,
      'PARISH'
    );

    if (amount > currentBalance) {
      throw new BadRequestException('withdrawalInsufficientBalance', {
        cause: new Error(),
        description: `Withdrawal amount (${amount}) exceeds available balance (${currentBalance}).`,
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

    // Only the network call itself is wrapped — a deliberately thrown
    // HttpException below (e.g. the "not accepted" case) must propagate
    // as-is, not get caught by this same try and re-wrapped into a
    // malformed, doubly-nested exception body.
    let withdrawalData: { code?: number; status?: string; transfer?: { amount_total: number; reference: string } };
    try {
      withdrawalData = await fetch(
        'https://api.notchpay.co/transfers',
        optionWithdrawMoney
      ).then((response) => response.json());
    } catch (error) {
      throw new UnprocessableEntityException('withdrawalFailed', {
        cause: error instanceof Error ? error : new Error(String(error)),
        description: 'Could not reach the payment provider.',
      });
    }

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

    throw new UnprocessableEntityException('withdrawalNotAccepted', {
      cause: new Error(),
      description: 'Withdrawal was not accepted by the payment provider.',
    });
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

    // Same split as withdrawMoney: only the network call is caught here, so
    // the "creation rejected" business exception below propagates as-is
    // instead of being re-caught and re-wrapped by this same try.
    let createRecipient: { code?: number };
    try {
      createRecipient = await fetch(
        'https://api.notchpay.co/recipients',
        optionCreateRecipient
      ).then((response) => response.json());
    } catch (error) {
      throw new UnprocessableEntityException('withdrawalRecipientFailed', {
        cause: error instanceof Error ? error : new Error(String(error)),
        description: 'Could not reach the payment provider.',
      });
    }

    if (createRecipient.code === 200) {
      // Internal update — this is a system-derived cache of the NotchPay
      // recipient id, not a user-initiated edit, so no requestUser/
      // ownership check applies here.
      await this.parishService.update(parishId, { receiverId: referenceId });
      return referenceId;
    }

    throw new UnprocessableEntityException('withdrawalRecipientFailed', {
      cause: new Error(),
      description: 'Failed to create payout recipient.',
    });
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
      await this.recordPaymentAudits(
        tx,
        [paymentId],
        PaymentStatus.REFUNDED,
        PaymentAudiAction.UPDATED,
        requestUser.id
      );

      return { code: 200, message: 'Payment refunded and ledger reversed.' };
    });
  }
}
