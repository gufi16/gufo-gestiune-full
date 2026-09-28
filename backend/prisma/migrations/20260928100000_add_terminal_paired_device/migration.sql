ALTER TABLE "Terminal"
ADD COLUMN IF NOT EXISTS "pairedDeviceId" TEXT;

-- Repair terminals disabled by the initial Gufo Go disconnect implementation.
UPDATE "Terminal"
SET "isActive" = true, "pairedDeviceId" = NULL
WHERE "deviceType" = 'GO' AND "isActive" = false;
