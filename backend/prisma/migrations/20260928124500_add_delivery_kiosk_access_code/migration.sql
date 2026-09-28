CREATE TABLE "DeliveryKioskAccessCode" (
  "id" TEXT NOT NULL,
  "terminalId" TEXT NOT NULL,
  "customerId" TEXT,
  "email" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DeliveryKioskAccessCode_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DeliveryKioskAccessCode_terminalId_email_createdAt_idx"
  ON "DeliveryKioskAccessCode"("terminalId", "email", "createdAt");
CREATE INDEX "DeliveryKioskAccessCode_email_expiresAt_idx"
  ON "DeliveryKioskAccessCode"("email", "expiresAt");
