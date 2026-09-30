DO $$ BEGIN
  CREATE TYPE "SubscriptionProduct" AS ENUM ('ERP_POS', 'DELIVERY', 'KDS', 'WAITER', 'GUFO_GO', 'KIOSK');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Subscription"
  ADD COLUMN IF NOT EXISTS "product" "SubscriptionProduct" NOT NULL DEFAULT 'ERP_POS';

DROP INDEX IF EXISTS "Subscription_licenseId_key";
CREATE INDEX IF NOT EXISTS "Subscription_licenseId_idx" ON "Subscription"("licenseId");
