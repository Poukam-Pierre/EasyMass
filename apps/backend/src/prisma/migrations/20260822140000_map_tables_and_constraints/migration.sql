-- Rename foreign key constraints (must happen before the table rename,
-- since ALTER TABLE ... RENAME CONSTRAINT needs the current table name)
ALTER TABLE "Administrator" RENAME CONSTRAINT "Administrator_userId_fkey" TO "fk_Administrator_User";
ALTER TABLE "Mass" RENAME CONSTRAINT "Mass_parishId_fkey" TO "fk_Mass_Parish";
ALTER TABLE "Mass" RENAME CONSTRAINT "Mass_priestId_fkey" TO "fk_Mass_Priest";
ALTER TABLE "MassOrder" RENAME CONSTRAINT "MassOrder_believerId_fkey" TO "fk_MassOrder_Believer";
ALTER TABLE "MassOrder" RENAME CONSTRAINT "MassOrder_massId_fkey" TO "fk_MassOrder_Mass";
ALTER TABLE "Notification" RENAME CONSTRAINT "Notification_parishId_fkey" TO "fk_Notification_Parish";
ALTER TABLE "Notification" RENAME CONSTRAINT "Notification_priestId_fkey" TO "fk_Notification_Priest";
ALTER TABLE "Parish" RENAME CONSTRAINT "Parish_adminId_fkey" TO "fk_Parish_Administrator";
ALTER TABLE "Parish" RENAME CONSTRAINT "Parish_city_id_fkey" TO "fk_Parish_City";
ALTER TABLE "Parish" RENAME CONSTRAINT "Parish_userId_fkey" TO "fk_Parish_User";
ALTER TABLE "Payment" RENAME CONSTRAINT "Payment_initiatedBy_fkey" TO "fk_Payment_Believer";
ALTER TABLE "Payment" RENAME CONSTRAINT "Payment_massOrderId_fkey" TO "fk_Payment_MassOrder";
ALTER TABLE "PaymentAudit" RENAME CONSTRAINT "PaymentAudit_changedByUserId_fkey" TO "fk_PaymentAudit_User";
ALTER TABLE "PaymentAudit" RENAME CONSTRAINT "PaymentAudit_paymentId_fkey" TO "fk_PaymentAudit_Payment";
ALTER TABLE "Priest" RENAME CONSTRAINT "Priest_homeParishId_fkey" TO "fk_Priest_Parish";
ALTER TABLE "Priest" RENAME CONSTRAINT "Priest_userId_fkey" TO "fk_Priest_User";
ALTER TABLE "RefreshToken" RENAME CONSTRAINT "RefreshToken_userId_fkey" TO "fk_RefreshToken_User";
ALTER TABLE "Transaction" RENAME CONSTRAINT "Transaction_paymentId_fkey" TO "fk_Transaction_Payment";

-- Rename indexes to match the named-constraint convention
ALTER INDEX "Mass_parishId_idx" RENAME TO "fk_Mass_Parish_idx";
ALTER INDEX "Mass_priestId_idx" RENAME TO "fk_Mass_Priest_idx";
ALTER INDEX "Mass_processAt_idx" RENAME TO "idx_mass_process_at";
ALTER INDEX "MassOrder_believerId_idx" RENAME TO "fk_MassOrder_Believer_idx";
ALTER INDEX "MassOrder_massId_idx" RENAME TO "fk_MassOrder_Mass_idx";
ALTER INDEX "MassOrder_createdAt_idx" RENAME TO "idx_mass_order_created_at";
ALTER INDEX "Notification_parishId_isRead_idx" RENAME TO "idx_notification_parish_unread";
ALTER INDEX "Notification_priestId_isRead_idx" RENAME TO "idx_notification_priest_unread";
ALTER INDEX "Parish_city_id_idx" RENAME TO "fk_Parish_City_idx";
ALTER INDEX "Parish_adminId_idx" RENAME TO "fk_Parish_Administrator_idx";
ALTER INDEX "Priest_homeParishId_idx" RENAME TO "fk_Priest_Parish_idx";
ALTER INDEX "RefreshToken_userId_idx" RENAME TO "fk_RefreshToken_User_idx";
ALTER INDEX "Payment_initiatedBy_idx" RENAME TO "fk_Payment_Believer_idx";
ALTER INDEX "Payment_massOrderId_idx" RENAME TO "fk_Payment_MassOrder_idx";
ALTER INDEX "Payment_referenceId_idx" RENAME TO "idx_payment_reference_id";
ALTER INDEX "Payment_status_idx" RENAME TO "idx_payment_status";
ALTER INDEX "PaymentAudit_paymentId_idx" RENAME TO "fk_PaymentAudit_Payment_idx";
ALTER INDEX "PaymentAudit_changedByUserId_idx" RENAME TO "fk_PaymentAudit_User_idx";
ALTER INDEX "Transaction_ownerId_ownerType_idx" RENAME TO "idx_transaction_owner";
ALTER INDEX "Transaction_paymentId_idx" RENAME TO "fk_Transaction_Payment_idx";
ALTER INDEX "Transaction_createdAt_idx" RENAME TO "idx_transaction_created_at";
ALTER INDEX "User_role_idx" RENAME TO "idx_user_role";

-- Rename tables to their snake_case @@map names
ALTER TABLE "Administrator" RENAME TO "administrator";
ALTER TABLE "Believer" RENAME TO "believer";
ALTER TABLE "City" RENAME TO "city";
ALTER TABLE "Mass" RENAME TO "mass";
ALTER TABLE "MassOrder" RENAME TO "mass_order";
ALTER TABLE "Notification" RENAME TO "notification";
ALTER TABLE "Parish" RENAME TO "parish";
ALTER TABLE "Payment" RENAME TO "payment";
ALTER TABLE "PaymentAudit" RENAME TO "payment_audit";
ALTER TABLE "Priest" RENAME TO "priest";
ALTER TABLE "RefreshToken" RENAME TO "refresh_token";
ALTER TABLE "Transaction" RENAME TO "transaction";
ALTER TABLE "User" RENAME TO "user";
