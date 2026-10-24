import { InternalServerErrorException } from '@nestjs/common';

/**
 * Headers for every NotchPay API call. Collecting money (payments) only
 * needs the public key; moving money out (recipients, transfers) also
 * needs the private key in X-Grant — NotchPay rejects those with
 * "Private Key Required" otherwise. The private key is server-side only:
 * never put it in a NEXT_PUBLIC_* variable.
 */
export function notchPayHeaders({
  granted = false,
}: { granted?: boolean } = {}): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: process.env.NOTCH_PUBLIC_KEY ?? '',
    'Content-Type': 'application/json',
  };
  if (!granted) return headers;

  const privateKey = process.env.NOTCH_PRIVATE_KEY;
  if (!privateKey) {
    // Fail before calling NotchPay rather than sending an empty X-Grant
    // and surfacing their opaque 406 to the parish.
    throw new InternalServerErrorException(
      'NOTCH_PRIVATE_KEY is not configured — required for NotchPay payouts.'
    );
  }
  return { ...headers, 'X-Grant': privateKey };
}
