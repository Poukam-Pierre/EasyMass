-- PlatformSettings becomes one row per currency (mirrors mass_price).
-- Add nullable first so the existing singleton row (id=1) isn't rejected,
-- backfill it as the platform's existing XAF config, then enforce
-- NOT NULL + UNIQUE.
ALTER TABLE "platform_settings" ADD COLUMN "currency" "Currency";

UPDATE "platform_settings" SET "currency" = 'xaf' WHERE "currency" IS NULL;

ALTER TABLE "platform_settings" ALTER COLUMN "currency" SET NOT NULL;

CREATE UNIQUE INDEX "platform_settings_currency_key" ON "platform_settings"("currency");
