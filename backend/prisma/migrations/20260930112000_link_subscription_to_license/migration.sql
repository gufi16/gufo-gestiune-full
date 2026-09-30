ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "licenseId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_licenseId_key" ON "Subscription"("licenseId");

ALTER TABLE "Subscription"
  ADD CONSTRAINT "Subscription_licenseId_fkey"
  FOREIGN KEY ("licenseId") REFERENCES "License"("id") ON DELETE SET NULL ON UPDATE CASCADE;
