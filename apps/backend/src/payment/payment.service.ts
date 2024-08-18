import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@Injectable()
@WebSocketGateway()
export class PaymentService {
  @WebSocketServer()
  server: Server;

  async handlePayment(payload: {
    amount: number;
    currency: string;
    channel: string;
    customer: {
      phone: string;
    };
    metadata?: Array<object>;
  }) {
    const optionPaymentInit = {
      method: 'POST',
      headers: {
        Authorization: 'YOUR_PUBLIC_KEY',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: payload.amount,
        currency: payload.currency,
        description: 'My first payment',
        customer: {
          email: 'easyMess@gmail.com',
          phone: payload.customer.phone,
        },
        reference: 'the unique reference',
      }),
    };

    try {
      const paymentInit = await fetch(
        'noth pay url payment initialization',
        optionPaymentInit
      ).then((response) => response.json());

      if (paymentInit.code === 201 && paymentInit.status === 'Accepted') {
        this.server.emit('initPayment', {
          msg: 'Payment initiated',
        });
      }

      const optionPaymentCharge = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: payload.channel,
          phone: payload.customer.phone,
        }),
      };

      const paymentCharge = await fetch(
        `charge Notch pay link/${paymentInit.reference}`,
        optionPaymentCharge
      ).then((response) => response.json());

      if (paymentCharge.code === 202 && paymentCharge.status === 'Accepted') {
        this.server.emit('paymentCharge', {
          msg: paymentCharge.message,
        });
      }

      if (paymentInit.code !== 201 && paymentCharge.code !== 202) {
        throw new UnauthorizedException(paymentInit.message);
      }
    } catch (error) {
      throw new UnprocessableEntityException(error);
    }
  }
}
