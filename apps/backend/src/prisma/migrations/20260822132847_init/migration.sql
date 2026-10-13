-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('usd', 'eur', 'gbp', 'ngn', 'xaf', 'xof', 'ghs');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('paypal', 'bank_transfer', 'online');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "PaymentAudiAction" AS ENUM ('created', 'updated', 'settled');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('income', 'income_reversal', 'withdrawal', 'platform_fee');

-- CreateEnum
CREATE TYPE "OwnerType" AS ENUM ('admin', 'priest', 'parish');

-- CreateEnum
CREATE TYPE "CreateMethod" AS ENUM ('parish', 'manual');

-- CreateEnum
CREATE TYPE "MassType" AS ENUM ('UNIQUE', 'TRIDUM', 'SEVEN', 'NOVENA', 'THIRTY');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ENGINEER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PRIEST', 'PARISH', 'ADMIN');

-- CreateTable
CREATE TABLE "Payment" (
    "paymentId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentInitiatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paidAt" TIMESTAMP(3),
    "status" "PaymentStatus" NOT NULL,
    "currency" "Currency" NOT NULL,
    "referenceId" TEXT,
    "initiatedBy" TEXT NOT NULL,
    "massOrderId" TEXT NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("paymentId")
);

-- CreateTable
CREATE TABLE "PaymentAudit" (
    "auditId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedByUserId" TEXT NOT NULL,
    "paymentAudiAction" "PaymentAudiAction" NOT NULL,

    CONSTRAINT "PaymentAudit_pkey" PRIMARY KEY ("auditId")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "transactionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DOUBLE PRECISION NOT NULL,
    "ownerId" TEXT NOT NULL,
    "ownerType" "OwnerType" NOT NULL,
    "transactionType" "TransactionType" NOT NULL,
    "balanceAfter" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "externalPayoutId" TEXT,
    "note" TEXT,
    "paymentId" TEXT,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("transactionId")
);

-- CreateTable
CREATE TABLE "User" (
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Believer" (
    "believerId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL DEFAULT 'Unknown',
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Believer_pkey" PRIMARY KEY ("believerId")
);

-- CreateTable
CREATE TABLE "Mass" (
    "massId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 2500,
    "processAt" TIMESTAMP(3),
    "intension" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "parishId" TEXT NOT NULL,
    "priestId" TEXT,
    "massType" "MassType" NOT NULL DEFAULT 'UNIQUE',

    CONSTRAINT "Mass_pkey" PRIMARY KEY ("massId")
);

-- CreateTable
CREATE TABLE "MassOrder" (
    "massOrderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "intension" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "believerId" TEXT NOT NULL,
    "massId" TEXT NOT NULL,

    CONSTRAINT "MassOrder_pkey" PRIMARY KEY ("massOrderId")
);

-- CreateTable
CREATE TABLE "Priest" (
    "priestId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "secondName" TEXT NOT NULL,
    "image" TEXT,
    "birthDate" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "authNumber" TEXT NOT NULL,
    "authCardImage" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdMethod" "CreateMethod" NOT NULL DEFAULT 'parish',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "homeParishId" TEXT,

    CONSTRAINT "Priest_pkey" PRIMARY KEY ("priestId")
);

-- CreateTable
CREATE TABLE "Parish" (
    "parishId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "managerName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "receiverId" TEXT,
    "city_id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Parish_pkey" PRIMARY KEY ("parishId")
);

-- CreateTable
CREATE TABLE "Administrator" (
    "adminId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Administrator_pkey" PRIMARY KEY ("adminId")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parishId" TEXT,
    "priestId" TEXT,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiredDate" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "city_id" TEXT NOT NULL,
    "city_name" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Cameroon',

    CONSTRAINT "City_pkey" PRIMARY KEY ("city_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paymentId_key" ON "Payment"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Believer_believerId_key" ON "Believer"("believerId");

-- CreateIndex
CREATE UNIQUE INDEX "Priest_authNumber_key" ON "Priest"("authNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Priest_userId_key" ON "Priest"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Parish_receiverId_key" ON "Parish"("receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "Parish_userId_key" ON "Parish"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Administrator_userId_key" ON "Administrator"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_refreshToken_key" ON "RefreshToken"("refreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "City_country_key" ON "City"("country");

-- CreateIndex
CREATE UNIQUE INDEX "City_city_name_country_key" ON "City"("city_name", "country");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_initiatedBy_fkey" FOREIGN KEY ("initiatedBy") REFERENCES "Believer"("believerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_massOrderId_fkey" FOREIGN KEY ("massOrderId") REFERENCES "MassOrder"("massOrderId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAudit" ADD CONSTRAINT "PaymentAudit_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("paymentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAudit" ADD CONSTRAINT "PaymentAudit_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("paymentId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mass" ADD CONSTRAINT "Mass_parishId_fkey" FOREIGN KEY ("parishId") REFERENCES "Parish"("parishId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mass" ADD CONSTRAINT "Mass_priestId_fkey" FOREIGN KEY ("priestId") REFERENCES "Priest"("priestId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MassOrder" ADD CONSTRAINT "MassOrder_believerId_fkey" FOREIGN KEY ("believerId") REFERENCES "Believer"("believerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MassOrder" ADD CONSTRAINT "MassOrder_massId_fkey" FOREIGN KEY ("massId") REFERENCES "Mass"("massId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Priest" ADD CONSTRAINT "Priest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Priest" ADD CONSTRAINT "Priest_homeParishId_fkey" FOREIGN KEY ("homeParishId") REFERENCES "Parish"("parishId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parish" ADD CONSTRAINT "Parish_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parish" ADD CONSTRAINT "Parish_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Administrator"("adminId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parish" ADD CONSTRAINT "Parish_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "City"("city_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Administrator" ADD CONSTRAINT "Administrator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_parishId_fkey" FOREIGN KEY ("parishId") REFERENCES "Parish"("parishId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_priestId_fkey" FOREIGN KEY ("priestId") REFERENCES "Priest"("priestId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

