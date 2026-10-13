import { Injectable, Logger } from '@nestjs/common';

/** Orange SMS Africa & Middle East API — https://developer.orange.com/apis/sms
 * Chosen over a pan-African aggregator (Africa's Talking) because SMS here
 * is only ever sent for MOBILE_MONEY checkouts, which are Cameroon numbers
 * by construction (Orange/MTN via NotchPay) — international buyers go
 * through PayPal and get an emailed invoice instead. Orange's direct
 * Cameroon rate (~22 FCFA/SMS) is roughly 6-7x cheaper than routing the
 * same message through a global aggregator. */
const TOKEN_URL = 'https://api.orange.com/oauth/v3/token';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private cachedToken: { accessToken: string; expiresAt: number } | null = null;

  /** Cameroon numbers are collected/stored locally (e.g. "699527317", no
   * country code) throughout this app — Orange's API needs full E.164
   * ("tel:+237699527317"). Left unprefixed if it already looks
   * internationally formatted, so a number that already has a country
   * code isn't double-prefixed. */
  private toTelUri(phone: string): string {
    const digits = phone.replace(/[^\d]/g, '');
    const withCountryCode = digits.startsWith('237') ? digits : `237${digits.replace(/^0+/, '')}`;
    return `tel:+${withCountryCode}`;
  }

  private async getAccessToken(): Promise<string | null> {
    if (this.cachedToken && this.cachedToken.expiresAt > Date.now()) {
      return this.cachedToken.accessToken;
    }

    const clientId = process.env.ORANGE_CLIENT_ID;
    const clientSecret = process.env.ORANGE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      this.logger.error(
        'ORANGE_CLIENT_ID/ORANGE_CLIENT_SECRET not configured — cannot send SMS.'
      );
      return null;
    }

    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ grant_type: 'client_credentials' }),
    }).then((res) => res.json());

    if (!response.access_token) {
      this.logger.error(`Failed to obtain Orange access token: ${JSON.stringify(response)}`);
      return null;
    }

    // expires_in is seconds (typically 3600) — refresh a minute early so a
    // token doesn't expire mid-request on a slow connection.
    this.cachedToken = {
      accessToken: response.access_token,
      expiresAt: Date.now() + (Number(response.expires_in) - 60) * 1000,
    };
    return this.cachedToken.accessToken;
  }

  async send(to: string, message: string): Promise<void> {
    const senderNumber = process.env.COUNTRY_SENDER_NUMBER;
    if (!senderNumber) {
      this.logger.error(
        'COUNTRY_SENDER_NUMBER not configured — cannot send SMS.'
      );
      return;
    }

    const accessToken = await this.getAccessToken();
    if (!accessToken) return;

    const senderAddress = this.toTelUri(senderNumber);
    // The tel: URI's ':' and '+' are valid in a URL path per RFC 3986, but
    // percent-encoding them here is a safe no-op against a spec-compliant
    // server and avoids relying on Orange's own parser tolerating raw ones.
    const response = await fetch(
      `https://api.orange.com/smsmessaging/v1/outbound/${encodeURIComponent(senderAddress)}/requests`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          outboundSMSMessageRequest: {
            address: this.toTelUri(to),
            senderAddress,
            ...(process.env.ORANGE_SENDER_NAME
              ? { senderName: process.env.ORANGE_SENDER_NAME }
              : {}),
            outboundSMSTextMessage: { message },
          },
        }),
      }
    ).then((res) => res.json());

    if (!response.outboundSMSMessageRequest?.resourceURL) {
      this.logger.error(`SMS to ${to} not confirmed sent: ${JSON.stringify(response)}`);
    }
  }
}
