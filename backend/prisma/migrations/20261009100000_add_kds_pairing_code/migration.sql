ALTER TABLE "Terminal" ADD COLUMN "pairingCode" TEXT;

CREATE INDEX "Terminal_tenantId_pairingCode_idx" ON "Terminal"("tenantId", "pairingCode");
