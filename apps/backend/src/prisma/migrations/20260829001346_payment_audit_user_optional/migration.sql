-- DropForeignKey
ALTER TABLE "payment_audit" DROP CONSTRAINT "fk_PaymentAudit_User";

-- AlterTable
ALTER TABLE "payment_audit" ALTER COLUMN "changedByUserId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "payment_audit" ADD CONSTRAINT "fk_PaymentAudit_User" FOREIGN KEY ("changedByUserId") REFERENCES "user"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
