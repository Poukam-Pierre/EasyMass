-- CreateEnum
CREATE TYPE "AccountTokenPurpose" AS ENUM ('setup', 'reset');

-- AlterTable
-- Every token that exists today was issued by the account-setup flow.
ALTER TABLE "account_setup_token" ADD COLUMN "purpose" "AccountTokenPurpose" NOT NULL DEFAULT 'setup';
