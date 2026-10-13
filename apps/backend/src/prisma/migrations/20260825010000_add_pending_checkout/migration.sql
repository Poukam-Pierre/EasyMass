-- CreateTable
CREATE TABLE "pending_checkout" (
    "id" TEXT NOT NULL,
    "gateway" "PaymentMethod" NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pending_checkout_pkey" PRIMARY KEY ("id")
);
