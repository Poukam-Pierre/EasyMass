-- AlterTable: PaymentAudit.changedByUserId becomes optional — most status
-- transitions are gateway/system-driven (webhook, cron reconciliation), not
-- performed by an authenticated user, so the audit trail must be able to
-- record those without a user actor.
ALTER TABLE "payment_audit" DROP CONSTRAINT "fk_PaymentAudit_User";

ALTER TABLE "payment_audit" ALTER COLUMN "changedByUserId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "payment_audit" ADD CONSTRAINT "fk_PaymentAudit_User" FOREIGN KEY ("changedByUserId") REFERENCES "user"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
