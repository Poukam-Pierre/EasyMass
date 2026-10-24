-- AlterTable
ALTER TABLE "user" ADD COLUMN     "emailVerifiedAt" TIMESTAMP(3);

-- Every account that already exists was created before verification
-- existed and has a working password — mark it verified so nobody already
-- using the platform gets locked out by this migration.
UPDATE "user" SET "emailVerifiedAt" = "createdAt";

-- CreateTable
CREATE TABLE "account_setup_token" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "account_setup_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_setup_token_tokenHash_key" ON "account_setup_token"("tokenHash");

-- CreateIndex
CREATE INDEX "fk_AccountSetupToken_User_idx" ON "account_setup_token"("userId");

-- AddForeignKey
ALTER TABLE "account_setup_token" ADD CONSTRAINT "fk_AccountSetupToken_User" FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
