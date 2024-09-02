import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { ParishService } from '../parish/parish.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly parishService: ParishService,
    private readonly transactionsService: TransactionsService
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

  async notifyPayment(paymentResult) {
    const {
      data: { reference },
    } = paymentResult;

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

      return paymentStatus;
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

    const parish = await this.parishService.findOne(id);

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
          await this.parishService.update(id, { receiverId: referenceId });
          return referenceId;
        }
      } catch (error) {
        throw new UnprocessableEntityException(error);
      }
    }
  }
}
