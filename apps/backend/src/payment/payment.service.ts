import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
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

    const masses = await Promise.all(
      massInfos.map((m) => this.massService.findOne(m.id))
    );
    if (masses.some((m) => !m)) {
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

    // Starting balances fetched once, outside the transaction, then tracked
    // in memory as each row is written — avoids a findFirst+create round
    // trip per split row (this loop can otherwise easily exceed Prisma's
    // interactive-transaction timeout under real network latency, as
    // observed against Neon's pooler).
    let parishBalance = await this.transactionsService.getCurrentBalance(
      this.prismaService,
      parishId,
      'PARISH'
    );
    let platformBalance = await this.transactionsService.getCurrentBalance(
      this.prismaService,
      PLATFORM_OWNER_ID,
      'ADMIN'
    );

    return this.prismaService.$transaction(
      async (tx) => {
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
              paymentMethod: 'ONLINE',
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
      },
      { timeout: 15000, maxWait: 10000 }
    );
  }

  /** Parish-only — there's no priest balance to withdraw from in this MVP.
   * Uses the parish's persisted payoutNumber (set via
   * PATCH /parishes/:id/payout-method) rather than trusting a client-
   * supplied number on every call. */
  async withdrawMoney(request, amount: number) {
    const parish = await resolveParishForUser(
      this.prismaService,
      request.user.id
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
        Authorization: process.env.NOTCH_PUBLIC_KEY,
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
        await this.transactionsService.createWithBalance(this.prismaService, {
          transactionType: 'WITHDRAWAL',
          ownerId: parish.parishId,
          ownerType: 'PARISH',
          amount: -Math.abs(withdrawalData.transfer.amount_total),
          externalPayoutId: withdrawalData.transfer.reference,
          createdByUser: { connect: { userId: request.user.id } },
        });

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

    if (parish.receiverId) {
      return parish.receiverId;
    }

    const optionCreateRecipient = {
      method: 'POST',
      headers: {
        Authorization: process.env.NOTCH_PUBLIC_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: 'cm.mobile',
        number: payoutNumber,
        phone: parish.phone,
        email: 'easyMess@gmail.com',
        country: 'CM',
        name: parish.name,
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

    return this.prismaService.$transaction(
      async (tx) => {
        for (const row of reversibleRows) {
          await this.transactionsService.createWithBalance(tx, {
            transactionType: 'INCOME_REVERSAL',
            ownerId: row.ownerId,
            ownerType: row.ownerType,
            amount: -row.amount,
            payment: { connect: { paymentId } },
            createdByUser: { connect: { userId: requestUser.id } },
            note: `Reversal of ${row.transactionType} ${row.transactionId}`,
          });
        }

        await tx.payment.update({
          where: { paymentId },
          data: { status: 'REFUNDED' },
        });

        return { code: 200, message: 'Payment refunded and ledger reversed.' };
      },
      { timeout: 15000, maxWait: 10000 }
    );
  }
}
