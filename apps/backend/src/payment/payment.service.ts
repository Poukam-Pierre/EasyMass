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
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionsService } from '../transactions/transactions.service';
import { BelieverService } from '../believer/believer.service';
import { MassService } from '../mass/mass.service';
import { PrismaService } from '../prisma/prisma.service';
import { PlatformSettingsService } from '../platform-settings/platform-settings.service';
import { resolveParishForUser } from '../common/user.utils';
import { PLATFORM_OWNER_ID } from '../common/constants';

@Injectable()
export class PaymentService {
  constructor(
    private readonly parishService: ParishService,
    private readonly transactionsService: TransactionsService,
    private readonly believerService: BelieverService,
    private readonly massService: MassService,
    private readonly prismaService: PrismaService,
    private readonly platformSettingsService: PlatformSettingsService
  ) {}

  /** "Collect" step — initiates the NotchPay payment page. Does not write
   * anything to our DB; the actual order/payment/ledger records are created
   * in notifyPayment once NotchPay confirms the charge. */
  async handlePayment(handlePaymentDto: CreateTransactionDto) {
    const { believerInfo, massInfos, paymentInfo } = handlePaymentDto;

    const optionPaymentInit = {
      method: 'POST',
      headers: {
        Authorization: process.env.NOTCH_PUBLIC_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: paymentInfo.amount,
        currency: paymentInfo.currency,
        description: 'Mass offering payment',
        email: 'easyMess@gmail.com',
        reference: createId(),
        callback: 'https://onlinepreps.net',
        // Each field individually stringified — metadata values are
        // commonly required to be strings, not nested objects, by payment
        // gateways. notifyPayment reads this back via
        // paymentStatus.transaction.metadata.{believerInfo,massInfos,
        // paymentInfo} and JSON.parses each — these key names must match
        // exactly (they previously didn't: massInfo vs massInfos, and
        // paymentInfo wasn't sent at all, so no webhook could ever succeed).
        metadata: {
          believerInfo: JSON.stringify(believerInfo),
          massInfos: JSON.stringify(massInfos),
          paymentInfo: JSON.stringify(paymentInfo),
        },
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

  /**
   * Webhook handler — confirms the charge with NotchPay, then creates the
   * Believer, one MassOrder + Payment per mass in the checkout (all
   * Payments share the gateway's referenceId), and the income/platform-fee
   * ledger split for each. All-or-nothing via one DB transaction.
   */
  async notifyPayment(paymentResult) {
    const {
      data: { reference },
    } = paymentResult;

    const checkPayment = {
      method: 'GET',
      headers: {
        Authorization: process.env.NOTCH_PUBLIC_KEY,
      },
    };

    const paymentStatus = await fetch(
      `https://api.notchpay.co/payments/${reference}`,
      checkPayment
    ).then((response) => response.json());

    // NotchPay's transaction.status: pending/processing/complete/failed/
    // canceled/expired — only 'complete' means money actually moved.
    if (paymentStatus?.transaction?.status !== 'complete') {
      return {
        code: 200,
        message: `Payment not complete (status: ${paymentStatus?.transaction?.status}); ignoring.`,
      };
    }

    // Sourced from the verify response (paymentStatus.transaction.metadata),
    // not the webhook body — NotchPay's webhook payload docs don't document
    // a metadata field at all, while the payment object schema does. Each
    // field was individually JSON-stringified in handlePayment (metadata
    // values commonly must be strings, not nested objects), so parse each
    // back out here.
    const metadata = paymentStatus.transaction?.metadata ?? {};
    const believerInfo = JSON.parse(metadata.believerInfo);
    const massInfos = JSON.parse(metadata.massInfos);
    const paymentInfo = JSON.parse(metadata.paymentInfo);

    // Reconcile: what the client says each mass costs must sum to what was
    // actually charged — don't trust the gateway total alone for the split.
    const sumOfCapturedPrices = massInfos.reduce(
      (total: number, m) => total + m.price,
      0
    );
    if (Math.abs(sumOfCapturedPrices - paymentInfo.amount) > 0.01) {
      throw new UnprocessableEntityException(
        'Mass order prices do not sum to the amount charged.'
      );
    }

    // One round trip for every mass in the checkout instead of one findOne
    // per mass.
    const masses = await this.massService.findManyByIds(
      massInfos.map((m) => m.id)
    );
    const massById = new Map(masses.map((m) => [m.massId, m]));
    if (massInfos.some((m) => !massById.has(m.id))) {
      throw new NotFoundException('One or more masses no longer exist.');
    }

    // All masses in one checkout must belong to the same parish — the
    // ledger attribution below assumes a single owner per batch.
    const parishIds = new Set(masses.map((m) => m.parishId));
    if (parishIds.size > 1) {
      throw new BadRequestException(
        'A single checkout cannot span multiple parishes.'
      );
    }
    const parishId = masses[0].parishId;

    const settings = await this.platformSettingsService.get();

    // Runs at SERIALIZABLE isolation (see PrismaService.runSerializableTransaction)
    // so a concurrent payment/withdrawal/refund touching the same parish or
    // platform balance can't produce a lost update — Postgres aborts one
    // side with a retryable conflict instead. Starting balances are read
    // inside this same transaction (not before it) so the read is part of
    // what gets serialized; they're then tracked in memory across the loop
    // to avoid a query per split row.
    return this.prismaService.runSerializableTransaction(async (tx) => {
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

      const believer = await tx.believer.create({
        data: { fullName: believerInfo.name, phone: believerInfo.phone },
      });

      for (const massInfo of massInfos) {
        const massOrder = await tx.massOrder.create({
          data: {
            intension: massInfo.intension,
            price: massInfo.price,
            currency: paymentInfo.currency,
            orderByBeliever: {
              connect: { believerId: believer.believerId },
            },
            mass: { connect: { massId: massInfo.id } },
          },
        });

        const payment = await tx.payment.create({
          data: {
            amount: massInfo.price,
            // NotchPay's collect flow is charged against paymentInfo.phone —
            // every payment this integration processes is a mobile money
            // charge (matching the payout side's channel: 'cm.mobile'), so
            // this reflects the actual method used, not a placeholder.
            paymentMethod: PaymentMethod.MOBILE_MONEY,
            status: 'COMPLETED',
            currency: paymentInfo.currency,
            paidAt: new Date(),
            referenceId: reference,
            believer: { connect: { believerId: believer.believerId } },
            massOrder: { connect: { massOrderId: massOrder.massOrderId } },
          },
        });

        const { platformFee, parishShare } =
          this.platformSettingsService.splitPrice(settings, massInfo.price);

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
