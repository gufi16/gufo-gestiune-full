CREATE TABLE "FiscalPrintLock" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "ownerLabel" TEXT,
    "leaseUntil" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FiscalPrintLock_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "FiscalPrintLock_locationId_key" ON "FiscalPrintLock"("locationId");
CREATE INDEX "FiscalPrintLock_tenantId_idx" ON "FiscalPrintLock"("tenantId");
CREATE INDEX "FiscalPrintLock_leaseUntil_idx" ON "FiscalPrintLock"("leaseUntil");
ALTER TABLE "FiscalPrintLock" ADD CONSTRAINT "FiscalPrintLock_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FiscalPrintLock" ADD CONSTRAINT "FiscalPrintLock_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
