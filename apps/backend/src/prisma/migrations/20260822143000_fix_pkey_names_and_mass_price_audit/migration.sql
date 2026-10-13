-- Finish renaming primary key constraints to match their snake_case table
-- names (an earlier db push attempt renamed administrator/believer/city's
-- pkeys before hitting an unrelated engine error; these are the rest).
ALTER TABLE "mass" RENAME CONSTRAINT "Mass_pkey" TO "mass_pkey";
ALTER TABLE "mass_order" RENAME CONSTRAINT "MassOrder_pkey" TO "mass_order_pkey";
ALTER TABLE "notification" RENAME CONSTRAINT "Notification_pkey" TO "notification_pkey";
ALTER TABLE "parish" RENAME CONSTRAINT "Parish_pkey" TO "parish_pkey";
ALTER TABLE "payment" RENAME CONSTRAINT "Payment_pkey" TO "payment_pkey";
ALTER TABLE "payment_audit" RENAME CONSTRAINT "PaymentAudit_pkey" TO "payment_audit_pkey";
ALTER TABLE "priest" RENAME CONSTRAINT "Priest_pkey" TO "priest_pkey";
ALTER TABLE "refresh_token" RENAME CONSTRAINT "RefreshToken_pkey" TO "refresh_token_pkey";
ALTER TABLE "transaction" RENAME CONSTRAINT "Transaction_pkey" TO "transaction_pkey";
ALTER TABLE "user" RENAME CONSTRAINT "User_pkey" TO "user_pkey";

-- AlterTable: audit who set/last changed a MassPrice, and when
ALTER TABLE "mass_price" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "mass_price" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "mass_price" ADD COLUMN "setByUserId" TEXT;
UPDATE "mass_price" SET "setByUserId" = (SELECT "userId" FROM "user" LIMIT 1) WHERE "setByUserId" IS NULL;
ALTER TABLE "mass_price" ALTER COLUMN "setByUserId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "fk_MassPrice_User_idx" ON "mass_price"("setByUserId");

-- AddForeignKey
ALTER TABLE "mass_price" ADD CONSTRAINT "fk_MassPrice_User" FOREIGN KEY ("setByUserId") REFERENCES "user"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
