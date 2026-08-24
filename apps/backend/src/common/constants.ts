/** Transaction.ownerId sentinel for the platform's own ledger (ownerType
 * ADMIN, transactionType PLATFORM_FEE/ADMIN_CORRECTION). ownerId has no real
 * FK for polymorphic owners (see schema review), so this is just a stable
 * constant, not a row in any table. */
export const PLATFORM_OWNER_ID = 'platform';
