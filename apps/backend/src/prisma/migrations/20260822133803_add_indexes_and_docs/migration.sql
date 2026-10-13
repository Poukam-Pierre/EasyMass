-- CreateIndex
CREATE INDEX "Mass_parishId_idx" ON "Mass"("parishId");

-- CreateIndex
CREATE INDEX "Mass_priestId_idx" ON "Mass"("priestId");

-- CreateIndex
CREATE INDEX "Mass_processAt_idx" ON "Mass"("processAt");

-- CreateIndex
CREATE INDEX "MassOrder_believerId_idx" ON "MassOrder"("believerId");

-- CreateIndex
CREATE INDEX "MassOrder_massId_idx" ON "MassOrder"("massId");

-- CreateIndex
CREATE INDEX "MassOrder_createdAt_idx" ON "MassOrder"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_parishId_isRead_idx" ON "Notification"("parishId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_priestId_isRead_idx" ON "Notification"("priestId", "isRead");

-- CreateIndex
CREATE INDEX "Parish_city_id_idx" ON "Parish"("city_id");

-- CreateIndex
CREATE INDEX "Parish_adminId_idx" ON "Parish"("adminId");

-- CreateIndex
CREATE INDEX "Payment_initiatedBy_idx" ON "Payment"("initiatedBy");

-- CreateIndex
CREATE INDEX "Payment_massOrderId_idx" ON "Payment"("massOrderId");

-- CreateIndex
CREATE INDEX "Payment_referenceId_idx" ON "Payment"("referenceId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "PaymentAudit_paymentId_idx" ON "PaymentAudit"("paymentId");

-- CreateIndex
CREATE INDEX "PaymentAudit_changedByUserId_idx" ON "PaymentAudit"("changedByUserId");

-- CreateIndex
CREATE INDEX "Priest_homeParishId_idx" ON "Priest"("homeParishId");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "Transaction_ownerId_ownerType_idx" ON "Transaction"("ownerId", "ownerType");

-- CreateIndex
CREATE INDEX "Transaction_paymentId_idx" ON "Transaction"("paymentId");

-- CreateIndex
CREATE INDEX "Transaction_createdAt_idx" ON "Transaction"("createdAt");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");
