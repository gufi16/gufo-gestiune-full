CREATE TABLE "DeliveryPushToken" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'ANDROID',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DeliveryPushToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DeliveryPushToken_token_key" ON "DeliveryPushToken"("token");
CREATE INDEX "DeliveryPushToken_customerId_idx" ON "DeliveryPushToken"("customerId");

ALTER TABLE "DeliveryPushToken" ADD CONSTRAINT "DeliveryPushToken_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "DeliveryCustomerAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
