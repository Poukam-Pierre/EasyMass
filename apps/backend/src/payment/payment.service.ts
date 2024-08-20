import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { BelieverService } from '../believer/believer.service';
import { createId } from '@paralleldrive/cuid2';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class PaymentService {
  constructor(private readonly believerService: BelieverService) {}

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

  async notifyPayment(paymentResult: any) {
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
}
