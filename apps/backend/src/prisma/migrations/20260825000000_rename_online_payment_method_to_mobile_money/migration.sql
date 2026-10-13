-- AlterEnum
-- PaymentMethod.ONLINE was a placeholder never accurate to how this app
-- actually charges (NotchPay mobile money, via paymentInfo.phone) — replaced
-- with MOBILE_MONEY. No existing "payment" rows use 'online' (verified
-- against the dev DB before writing this migration), so no data backfill
-- step is needed.
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('paypal', 'bank_transfer', 'mobile_money');
ALTER TABLE "payment" ALTER COLUMN "paymentMethod" TYPE "PaymentMethod_new" USING ("paymentMethod"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "public"."PaymentMethod_old";
COMMIT;
