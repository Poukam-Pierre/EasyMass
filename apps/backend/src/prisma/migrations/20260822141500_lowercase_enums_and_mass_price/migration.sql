-- AlterEnum: MassType values now map to lowercase DB labels; TRIDUM -> TRIDUUM
BEGIN;
CREATE TYPE "MassType_new" AS ENUM ('unique', 'triduum', 'seven', 'novena', 'thirty');
ALTER TABLE "mass" ALTER COLUMN "massType" DROP DEFAULT;
ALTER TABLE "mass" ALTER COLUMN "massType" TYPE "MassType_new" USING (
  CASE "massType"::text
    WHEN 'UNIQUE' THEN 'unique'
    WHEN 'TRIDUM' THEN 'triduum'
    WHEN 'SEVEN' THEN 'seven'
    WHEN 'NOVENA' THEN 'novena'
    WHEN 'THIRTY' THEN 'thirty'
  END::"MassType_new"
);
ALTER TYPE "MassType" RENAME TO "MassType_old";
ALTER TYPE "MassType_new" RENAME TO "MassType";
DROP TYPE "MassType_old";
ALTER TABLE "mass" ALTER COLUMN "massType" SET DEFAULT 'unique';
COMMIT;

-- AlterEnum: Role values now map to lowercase DB labels
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('engineer', 'admin');
ALTER TABLE "administrator" ALTER COLUMN "role" TYPE "Role_new" USING (
  CASE "role"::text
    WHEN 'ENGINEER' THEN 'engineer'
    WHEN 'ADMIN' THEN 'admin'
  END::"Role_new"
);
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
COMMIT;

-- AlterEnum: UserRole values now map to lowercase DB labels
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('priest', 'parish', 'admin');
ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "user" ALTER COLUMN "role" TYPE "UserRole_new" USING (
  CASE "role"::text
    WHEN 'PRIEST' THEN 'priest'
    WHEN 'PARISH' THEN 'parish'
    WHEN 'ADMIN' THEN 'admin'
  END::"UserRole_new"
);
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'admin';
COMMIT;

-- AlterTable: capture which currency a MassOrder's price is denominated in
ALTER TABLE "mass_order" ADD COLUMN "currency" "Currency" NOT NULL DEFAULT 'xaf';

-- CreateTable: explicit per-currency listed prices for a Mass
CREATE TABLE "mass_price" (
    "massPriceId" TEXT NOT NULL,
    "massId" TEXT NOT NULL,
    "currency" "Currency" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "mass_price_pkey" PRIMARY KEY ("massPriceId")
);

-- CreateIndex
CREATE INDEX "fk_MassPrice_Mass_idx" ON "mass_price"("massId");

-- CreateIndex
CREATE UNIQUE INDEX "mass_price_massId_currency_key" ON "mass_price"("massId", "currency");

-- AddForeignKey
ALTER TABLE "mass_price" ADD CONSTRAINT "fk_MassPrice_Mass" FOREIGN KEY ("massId") REFERENCES "mass"("massId") ON DELETE RESTRICT ON UPDATE CASCADE;
