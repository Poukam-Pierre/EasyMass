import { notchPayHeaders } from './notchpay';

describe('notchPayHeaders', () => {
  const env = { ...process.env };
  beforeEach(() => {
    process.env.NOTCH_PUBLIC_KEY = 'pk_test';
    process.env.NOTCH_PRIVATE_KEY = 'sk_test';
  });
  afterAll(() => {
    process.env = env;
  });

  it('sends only the public key for payment calls', () => {
    expect(notchPayHeaders()).toEqual({
      Authorization: 'pk_test',
      'Content-Type': 'application/json',
    });
  });

  it('adds the private key as X-Grant for payout calls', () => {
    expect(notchPayHeaders({ granted: true })['X-Grant']).toBe('sk_test');
  });

  it('refuses a payout call when the private key is missing', () => {
    delete process.env.NOTCH_PRIVATE_KEY;
    expect(() => notchPayHeaders({ granted: true })).toThrow(
      'NOTCH_PRIVATE_KEY'
    );
    // Payment collection keeps working without it.
    expect(() => notchPayHeaders()).not.toThrow();
  });
});
