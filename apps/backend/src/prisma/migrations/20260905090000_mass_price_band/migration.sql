-- CreateTable
CREATE TABLE "mass_price_band" (
    "massPriceBandId" TEXT NOT NULL,
    "currency" "Currency" NOT NULL,
    "minPrice" DOUBLE PRECISION NOT NULL,
    "maxPrice" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "setByUserId" TEXT NOT NULL,

    CONSTRAINT "mass_price_band_pkey" PRIMARY KEY ("massPriceBandId")
);

-- CreateIndex
CREATE INDEX "idx_mass_price_band_currency" ON "mass_price_band"("currency");

-- CreateIndex
CREATE INDEX "fk_MassPriceBand_User_idx" ON "mass_price_band"("setByUserId");

-- AddForeignKey
ALTER TABLE "mass_price_band" ADD CONSTRAINT "fk_MassPriceBand_User" FOREIGN KEY ("setByUserId") REFERENCES "user"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
