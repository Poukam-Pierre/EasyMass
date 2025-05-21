import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { ParishService } from '../parish/parish.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionsService } from '../transactions/transactions.service';
import { BelieverService } from '../believer/believer.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly parishService: ParishService,
    private readonly transactionsService: TransactionsService,
    private readonly believerService: BelieverService,
    private readonly prismaService: PrismaService
  ) {}

  async handlePayment(handlePaymentDto: CreateTransactionDto) {
    const optionPaymentInit = {
      method: 'POST',
      headers: {
        Authorization: process.env.NOTCH_PUBLIC_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: handlePaymentDto.paymentInfo.amount,
        currency: handlePaymentDto.paymentInfo.currency,
        description: 'My first payment',
        email: 'easyMess@gmail.com',
        reference: createId(),
        callback: 'https://onlinepreps.net',
        metadata: JSON.stringify({
          believerInfo: JSON.stringify(handlePaymentDto.believerInfo),
          massInfo: JSON.stringify(handlePaymentDto.massInfo),
        }),
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
    } catch (error) {
      throw new UnprocessableEntityException(error);
    }
  }

  /**
   * This function handles the payment confirmation and then creates the believer owner.
   * @param paymentResult
   * @returns
   */
  async notifyPayment(paymentResult) {
    // Verify what data is received and extract metadata
    const {
      data: { reference },
    } = paymentResult;

    const { believerInfo, massInfos, paymentInfo } = JSON.parse(
      paymentResult.data
    );

    const believerId = createId();

    const checkPayment = {
      port: 443,
      method: 'GET',
      headers: {
        Authorization: process.env.NOTCH_PUBLIC_KEY,
      },
    };

    try {
      const paymentStatus = await fetch(
        `https://api.notchpay.co/payments/${reference}`,
        checkPayment
      ).then((response) => response.json());

      // If payment status is positif, then save the believer owner in db.
      // Then return the confirmation message for ordering masses.
      if (paymentStatus) {
        const massOrders = massInfos.map((massInfo) => ({
          intension: massInfo.intension,
          price: massInfo.price,
          massId: massInfo.id,
        }));

        await this.believerService.create({
          id: believerId,
          name: believerInfo.name,
          email: believerInfo.email,
          massOrder: {
            createMany: {
              data: massOrders,
            },
          },
        });

        // Extract all data from webhook parameters
        await this.transactionsService.create({
          transactionId: reference,
          currency: 'xaf',
          price: paymentInfo.amount,
          status: 'VALIDED',
          paymentMethod: paymentInfo.paymentMethod,
          believer: {
            connect: {
              id: believerId,
            },
          },
        });
      }
      return 'Bill of masses ordered';
    } catch (error) {
      throw new UnprocessableEntityException(error);
    }
  }

  async withdrawMoney(request, receiverNumber, amount) {
    const { id } = request.user;
    const createRecipent = await this.createOrRetreiveRecipient(
      id,
      receiverNumber
    );

    const optionWithdrawMoney = {
      method: 'POST',
      headers: {
        Authorization: process.env.NOTCH_PUBLIC_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount,
        currency: 'XAF',
        description: 'Cash out parish money',
        reference: createRecipent,
      }),
    };

    try {
      const withdrawalData = await fetch(
        'https://api.notchpay.co/transfers',
        optionWithdrawMoney
      ).then((response) => response.json());

      if (withdrawalData.code === 201 && withdrawalData.status === 'Accepted') {
        await this.transactionsService.create({
          transactionId: withdrawalData.transfer.reference,
          price: withdrawalData.transfer.amount_total,
          status: 'INIT',
          paymentMethod: 'MoMo',
          currency: 'XAF',
          initByParish: {
            connect: {
              id,
            },
          },
        });

        return { code: 201, message: 'Payment initiated successfully' };
      }
    } catch (error) {
      throw new UnprocessableEntityException(error);
    }
  }

  async createOrRetreiveRecipient(
    id: number,
    receiverNumber: string
  ): Promise<string> {
    const referenceId = createId();

    const parish = await this.prismaService.parish.findUnique({
      where: {
        id,
      },
      select: {
        receiverId: true,
        phone: true,
        name: true,
      },
    });

    if (parish.receiverId) {
      return parish.receiverId;
    } else {
      const optionCreateRecipient = {
        method: 'POST',
        headers: {
          Authorization: process.env.NOTCH_PUBLIC_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: 'cm.mobile',
          number: receiverNumber,
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
          await this.parishService.updateParish(id, { referenceId });
          return referenceId;
        }
      } catch (error) {
        throw new UnprocessableEntityException(error);
      }
    }
  }
}
