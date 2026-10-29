CREATE TABLE "WaiterPairingRequest" (
    "id" TEXT NOT NULL,
    "pairingCode" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WaiterPairingRequest_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "WaiterPairingRequest_pairingCode_deviceId_key" ON "WaiterPairingRequest"("pairingCode", "deviceId");
CREATE INDEX "WaiterPairingRequest_pairingCode_idx" ON "WaiterPairingRequest"("pairingCode");
