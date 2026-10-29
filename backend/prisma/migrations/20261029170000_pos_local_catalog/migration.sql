CREATE TABLE "PosLocalCatalog" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "locationId" TEXT NOT NULL,
  "sourceTerminalId" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX "PosLocalCatalog_tenantId_companyId_locationId_key" ON "PosLocalCatalog"("tenantId", "companyId", "locationId");
