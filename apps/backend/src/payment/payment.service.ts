import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { BelieverService } from '../believer/believer.service';

@Injectable()
export class PaymentService {
  constructor(private readonly believerService: BelieverService) {}

  async handlePayment(handlePaymentDto: CreateTransactionDto) {
    const optionPaymentInit = {
      method: 'POST',
      headers: {
        Authorization: 'YOUR_PUBLIC_KEY',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: handlePaymentDto.orderInfo.amount,
        currency: handlePaymentDto.orderInfo.currency,
        description: 'My first payment',
        email: 'easyMess@gmail.com',
        reference: 'the unique reference',
        callback: 'the callback url',
      }),
    };

    try {
      const paymentInit = await fetch(
        'noth pay url payment initialization',
        optionPaymentInit
      ).then((response) => response.json());

      if (paymentInit.code === 201 && paymentInit.status === 'Accepted') {
        return paymentInit.authorization_url;
      }
    } catch (error) {
      throw new UnprocessableEntityException(error);
    }
  }

  notifyPayment(paymentResult: object) {
    return;
  }
}
