ALTER TABLE "PlatformConfig"
  ADD COLUMN IF NOT EXISTS "billingEfacturaAccessToken" TEXT,
  ADD COLUMN IF NOT EXISTS "billingEfacturaCertSerial" TEXT,
  ADD COLUMN IF NOT EXISTS "billingEfacturaCertPasswordEnc" TEXT,
  ADD COLUMN IF NOT EXISTS "billingEfacturaCertFilename" TEXT,
  ADD COLUMN IF NOT EXISTS "billingEfacturaCertUploadedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "billingEfacturaLastError" TEXT;

ALTER TABLE "Invoice"
  ADD COLUMN IF NOT EXISTS "efacturaStatus" "EFacturaStatus" NOT NULL DEFAULT 'NOT_READY',
  ADD COLUMN IF NOT EXISTS "efacturaUploadIndex" TEXT,
  ADD COLUMN IF NOT EXISTS "efacturaDownloadId" TEXT,
  ADD COLUMN IF NOT EXISTS "efacturaPreparedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "efacturaSentAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "efacturaLastCheckAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "efacturaXmlText" TEXT,
  ADD COLUMN IF NOT EXISTS "efacturaErrorText" TEXT;
