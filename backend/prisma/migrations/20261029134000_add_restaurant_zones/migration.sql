CREATE TABLE "RestaurantZone" (
    "id" SERIAL NOT NULL,
    "tenantId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "sourceId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RestaurantZone_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "RestaurantZone_tenantId_locationId_sourceId_key" ON "RestaurantZone"("tenantId", "locationId", "sourceId");
CREATE INDEX "RestaurantZone_tenantId_locationId_isActive_idx" ON "RestaurantZone"("tenantId", "locationId", "isActive");
