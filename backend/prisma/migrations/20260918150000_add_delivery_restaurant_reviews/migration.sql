CREATE TABLE "DeliveryRestaurantReview" (
  "id" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "integrationId" TEXT NOT NULL,
  "externalOrderId" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "comment" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DeliveryRestaurantReview_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DeliveryRestaurantReview_externalOrderId_key" ON "DeliveryRestaurantReview"("externalOrderId");
CREATE UNIQUE INDEX "DeliveryRestaurantReview_customerId_externalOrderId_key" ON "DeliveryRestaurantReview"("customerId", "externalOrderId");
CREATE INDEX "DeliveryRestaurantReview_integrationId_idx" ON "DeliveryRestaurantReview"("integrationId");
CREATE INDEX "DeliveryRestaurantReview_customerId_idx" ON "DeliveryRestaurantReview"("customerId");

ALTER TABLE "DeliveryRestaurantReview" ADD CONSTRAINT "DeliveryRestaurantReview_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "DeliveryCustomerAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DeliveryRestaurantReview" ADD CONSTRAINT "DeliveryRestaurantReview_integrationId_fkey"
  FOREIGN KEY ("integrationId") REFERENCES "ExternalIntegration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DeliveryRestaurantReview" ADD CONSTRAINT "DeliveryRestaurantReview_externalOrderId_fkey"
  FOREIGN KEY ("externalOrderId") REFERENCES "ExternalOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
