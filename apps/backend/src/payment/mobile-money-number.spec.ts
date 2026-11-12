import {
  toLocalCameroonNumber,
  validatePhoneNumber,
} from '@easy-messe/libs/utils';

describe('Cameroon mobile money numbers (payout recipient)', () => {
  it.each([
    ['699527317', '699527317'],
    ['+237 699 52 73 17', '699527317'],
    ['00237699527317', '699527317'],
    ['237-699-527-317', '699527317'],
    ['0699527317', '699527317'],
  ])('normalizes %s to %s', (typed, local) => {
    expect(toLocalCameroonNumber(typed)).toBe(local);
  });

  it('keeps a 237-looking local number intact', () => {
    // Only a prefix followed by exactly 9 digits is a country code.
    expect(toLocalCameroonNumber('237123')).toBe('237123');
  });

  it.each([
    ['+237677000000', 0], // MTN 67x
    ['681000000', 0], // MTN 68x
    ['652000000', 0], // MTN 650-654
    ['+237699000000', 1], // Orange 69x
    ['657000000', 1], // Orange 655-659
    ['222000000', -1], // landline — no mobile money channel
  ])('detects the network of %s', (typed, network) => {
    expect(validatePhoneNumber(toLocalCameroonNumber(typed))).toBe(network);
  });
});
