CREATE TABLE "RestaurantTable" (
    "id" SERIAL NOT NULL,
    "tenantId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "zoneId" INTEGER,
    "name" TEXT NOT NULL,
    "cartJson" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RestaurantTable_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RestaurantTable_tenantId_locationId_idx" ON "RestaurantTable"("tenantId", "locationId");
CREATE INDEX "RestaurantTable_locationId_isActive_idx" ON "RestaurantTable"("locationId", "isActive");
