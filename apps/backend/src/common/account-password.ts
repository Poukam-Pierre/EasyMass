import { BadRequestException } from '@nestjs/common';
import { randomInt } from 'crypto';
import { IsStrongPassword } from 'class-validator';

/** The one account password rule — used both to validate a password a
 * user chooses and to generate the one we suggest, so the two can't
 * drift. The UI mirrors it as ACCOUNT_PASSWORD_PATTERN in libs/utils;
 * change both together. */
export const ACCOUNT_PASSWORD_MIN_LENGTH = 10;

export function IsAccountPassword(): PropertyDecorator {
  return IsStrongPassword(
    {
      minLength: ACCOUNT_PASSWORD_MIN_LENGTH,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      minUppercase: 1,
    },
    {
      message: () => {
        throw new BadRequestException(
          'Password does not meet security requirements.',
          {
            cause: new Error(),
            description: `Provided password not strong enough. Use at least ${ACCOUNT_PASSWORD_MIN_LENGTH} characters, with 1 lowercase, 1 uppercase, 1 number and 1 symbol.`,
          }
        );
      },
    }
  );
}

// Look-alike characters (0/O, 1/l/I) left out — a suggested password may
// be copied by hand, and an ambiguous one is a support call.
const CHARACTER_CLASSES = [
  'abcdefghijkmnopqrstuvwxyz',
  'ABCDEFGHJKLMNPQRSTUVWXYZ',
  '23456789',
  '!@#$%&*?-_+=',
];
const GENERATED_PASSWORD_LENGTH = 16;

/** A random password that always satisfies IsAccountPassword: one
 * character from every class, the rest from all of them, then shuffled so
 * the guaranteed ones aren't always up front. crypto.randomInt, not
 * Math.random — this is a credential. */
export function generateAccountPassword(): string {
  const all = CHARACTER_CLASSES.join('');
  const pick = (set: string) => set[randomInt(set.length)];
  const chars = [
    ...CHARACTER_CLASSES.map(pick),
    ...Array.from(
      { length: GENERATED_PASSWORD_LENGTH - CHARACTER_CLASSES.length },
      () => pick(all)
    ),
  ];
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}
