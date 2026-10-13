-- Note: `processAt` is renamed to `startAt` via RENAME COLUMN below (not
-- dropped/recreated) so any existing data is preserved, not lost.
-- CreateEnum
CREATE TYPE "MassStatus" AS ENUM ('open', 'closed', 'processing', 'completed');

-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'refunded';

-- AlterEnum
ALTER TYPE "TransactionType" ADD VALUE 'admin_correction';

-- DropForeignKey
ALTER TABLE "priest" DROP CONSTRAINT "fk_Priest_User";

-- DropIndex
DROP INDEX "idx_mass_process_at";

-- AlterTable
ALTER TABLE "administrator" RENAME CONSTRAINT "Administrator_pkey" TO "administrator_pkey";

-- AlterTable
ALTER TABLE "believer" RENAME CONSTRAINT "Believer_pkey" TO "believer_pkey";

-- AlterTable
ALTER TABLE "city" RENAME CONSTRAINT "City_pkey" TO "city_pkey";

-- AlterTable
ALTER TABLE "mass" RENAME COLUMN "processAt" TO "startAt";
ALTER TABLE "mass" ALTER COLUMN "startAt" SET NOT NULL;
ALTER TABLE "mass" ADD COLUMN     "estimatedDurationMinutes" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "intentionsSentAt" TIMESTAMP(3),
ADD COLUMN     "status" "MassStatus" NOT NULL DEFAULT 'open';

-- AlterTable
ALTER TABLE "mass_price" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "parish" ADD COLUMN     "isBlocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "payoutBlocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "payoutNumber" TEXT;

-- AlterTable
ALTER TABLE "priest" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "transaction" ADD COLUMN     "createdByUserId" TEXT;

-- CreateTable
CREATE TABLE "platform_settings" (
    "id" SERIAL NOT NULL,
    "platformFeePercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "platformFeeFixedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedByUserId" TEXT,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fk_PlatformSettings_User_idx" ON "platform_settings"("updatedByUserId");

-- CreateIndex
CREATE INDEX "idx_mass_start_at" ON "mass"("startAt");

-- CreateIndex
CREATE INDEX "idx_mass_status" ON "mass"("status");

-- CreateIndex
CREATE INDEX "idx_parish_is_blocked" ON "parish"("isBlocked");

-- CreateIndex
CREATE INDEX "fk_Transaction_User_idx" ON "transaction"("createdByUserId");

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "fk_Transaction_User" FOREIGN KEY ("createdByUserId") REFERENCES "user"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "priest" ADD CONSTRAINT "fk_Priest_User" FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_settings" ADD CONSTRAINT "fk_PlatformSettings_User" FOREIGN KEY ("updatedByUserId") REFERENCES "user"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "Administrator_userId_key" RENAME TO "administrator_userId_key";

-- RenameIndex
ALTER INDEX "Believer_believerId_key" RENAME TO "believer_believerId_key";

-- RenameIndex
ALTER INDEX "City_city_name_country_key" RENAME TO "city_city_name_country_key";

-- RenameIndex
ALTER INDEX "Parish_receiverId_key" RENAME TO "parish_receiverId_key";

-- RenameIndex
ALTER INDEX "Parish_userId_key" RENAME TO "parish_userId_key";

-- RenameIndex
ALTER INDEX "Payment_paymentId_key" RENAME TO "payment_paymentId_key";

-- RenameIndex
ALTER INDEX "Priest_authNumber_key" RENAME TO "priest_authNumber_key";

-- RenameIndex
ALTER INDEX "Priest_userId_key" RENAME TO "priest_userId_key";

-- RenameIndex
ALTER INDEX "RefreshToken_refreshToken_key" RENAME TO "refresh_token_refreshToken_key";

-- RenameIndex
ALTER INDEX "User_email_key" RENAME TO "user_email_key";
