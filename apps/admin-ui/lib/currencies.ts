// Matches the backend's Currency enum exactly (Prisma's @map only affects
// the DB column value, not the string the API actually sends/expects).
export const CURRENCIES = ['XAF', 'USD', 'EUR', 'GBP', 'NGN', 'XOF', 'GHS'] as const;
export const BASE_CURRENCY = 'XAF';
