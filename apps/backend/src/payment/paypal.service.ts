import { Injectable, InternalServerErrorException } from '@nestjs/common';

interface PaypalPurchaseUnit {
  /** massId — lets PayPal's response be matched back to a mass without a
   * metadata bag (PayPal's Orders API doesn't have one big enough for our
   * full checkout payload). */
  referenceId: string;
  amount: number;
  currency: string;
}

interface PaypalAccessToken {
  value: string;
  expiresAt: number;
}

/**
 * Thin wrapper over PayPal's Orders v2 REST API (create + capture) and the
 * v1 webhook-signature-verification endpoint. Credentials are read directly
 * from process.env — see the PAYPAL_* entries in the repo-root .env for
 * where to paste them (sandbox keys from
 * https://developer.paypal.com/dashboard/applications/sandbox, live keys
 * from the "Live" tab of the same page).
 */
@Injectable()
export class PaypalService {
  private cachedToken: PaypalAccessToken | null = null;

  private get apiBase(): string {
    return process.env.PAYPAL_MODE === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
  }

  /** OAuth2 client_credentials grant (PayPal's REST API auth model — every
   * other call needs this as a Bearer token). Cached in memory until
   * shortly before PayPal's stated expiry so we're not round-tripping for a
   * token on every request. */
  private async getAccessToken(): Promise<string> {
    if (this.cachedToken && this.cachedToken.expiresAt > Date.now()) {
      return this.cachedToken.value;
    }

    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    const response = await fetch(`${this.apiBase}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${clientId}:${clientSecret}`
        ).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    }).then((res) => res.json());

    if (!response.access_token) {
      throw new InternalServerErrorException(
        'Failed to authenticate with PayPal.'
      );
    }

    this.cachedToken = {
      value: response.access_token,
      // 60s safety margin so a token doesn't expire mid-use.
      expiresAt: Date.now() + (response.expires_in - 60) * 1000,
    };
    return this.cachedToken.value;
  }

  /** One purchase_unit per mass in the checkout — each carries its own
   * captured amount, so (unlike NotchPay) the split doesn't depend on
   * trusting a client-supplied total. Returns the order id and the
   * "approve" link the customer must be redirected to. */
  async createOrder(
    purchaseUnits: PaypalPurchaseUnit[],
    returnUrl: string,
    cancelUrl: string
  ): Promise<{ orderId: string; approveUrl: string }> {
    const accessToken = await this.getAccessToken();

    const order = await fetch(`${this.apiBase}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: purchaseUnits.map((u) => ({
          reference_id: u.referenceId,
          amount: {
            currency_code: u.currency,
            value: u.amount.toFixed(2),
          },
        })),
        application_context: {
          return_url: returnUrl,
          cancel_url: cancelUrl,
          user_action: 'PAY_NOW',
        },
      }),
    }).then((res) => res.json());

    const approveUrl = order.links?.find(
      (link: { rel: string }) => link.rel === 'approve'
    )?.href;

    if (!order.id || !approveUrl) {
      throw new InternalServerErrorException('Failed to create PayPal order.');
    }

    return { orderId: order.id, approveUrl };
  }

  /**
   * Read-only order lookup — the working set for the reconciliation cron's
   * PayPal pass (mirroring reconcileNotchPayPayment): checks whether an
   * order stuck PENDING in our own DB (e.g. the customer closed the tab
   * before the return redirect completed, and the webhook was missed too)
   * has actually been approved/completed on PayPal's side, without
   * capturing anything itself.
   */
  async getOrderStatus(orderId: string): Promise<{ status?: string }> {
    const accessToken = await this.getAccessToken();

    return fetch(`${this.apiBase}/v2/checkout/orders/${orderId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then((res) => res.json());
  }

  /**
   * Confirms the charge. Called from the return-URL handler and, as a
   * durability backstop, from the webhook handler — capturing an
   * already-captured PayPal order id just returns the existing capture
   * rather than double-charging, so calling this twice for the same order
   * is safe.
   */
  async captureOrder(orderId: string): Promise<{
    status: string;
    [key: string]: unknown;
  }> {
    const accessToken = await this.getAccessToken();

    return fetch(`${this.apiBase}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }).then((res) => res.json());
  }

  /** Required before trusting an incoming webhook body — the endpoint is
   * necessarily @Public() (PayPal calls it server-to-server, no session to
   * attach a JWT to), so this is what stands in for auth on that route. */
  async verifyWebhookSignature(
    headers: Record<string, string | undefined>,
    webhookEvent: unknown
  ): Promise<boolean> {
    const accessToken = await this.getAccessToken();

    const result = await fetch(
      `${this.apiBase}/v1/notifications/verify-webhook-signature`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auth_algo: headers['paypal-auth-algo'],
          cert_url: headers['paypal-cert-url'],
          transmission_id: headers['paypal-transmission-id'],
          transmission_sig: headers['paypal-transmission-sig'],
          transmission_time: headers['paypal-transmission-time'],
          webhook_id: process.env.PAYPAL_WEBHOOK_ID,
          webhook_event: webhookEvent,
        }),
      }
    ).then((res) => res.json());

    return result.verification_status === 'SUCCESS';
  }
}
