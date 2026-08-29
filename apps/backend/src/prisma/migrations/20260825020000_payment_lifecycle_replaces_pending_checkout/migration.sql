-- Payment now owns the full checkout lifecycle (PENDING at initiation ->
-- COMPLETED/FAILED/EXPIRED at confirmation), replacing the separate
-- pending_checkout table. See PaymentService.finalizeCheckout.

-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'expired';

-- DropTable
DROP TABLE "pending_checkout";
