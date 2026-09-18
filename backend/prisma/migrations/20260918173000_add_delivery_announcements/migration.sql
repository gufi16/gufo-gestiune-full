CREATE TABLE "DeliveryAnnouncement" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DeliveryAnnouncement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DeliveryAnnouncementRead" (
    "id" TEXT NOT NULL,
    "announcementId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DeliveryAnnouncementRead_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DeliveryAnnouncementRead_announcementId_customerId_key" ON "DeliveryAnnouncementRead"("announcementId", "customerId");
CREATE INDEX "DeliveryAnnouncement_integrationId_idx" ON "DeliveryAnnouncement"("integrationId");
CREATE INDEX "DeliveryAnnouncement_isPublished_publishedAt_idx" ON "DeliveryAnnouncement"("isPublished", "publishedAt");
CREATE INDEX "DeliveryAnnouncement_expiresAt_idx" ON "DeliveryAnnouncement"("expiresAt");
CREATE INDEX "DeliveryAnnouncementRead_customerId_idx" ON "DeliveryAnnouncementRead"("customerId");

ALTER TABLE "DeliveryAnnouncement" ADD CONSTRAINT "DeliveryAnnouncement_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "ExternalIntegration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DeliveryAnnouncementRead" ADD CONSTRAINT "DeliveryAnnouncementRead_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "DeliveryAnnouncement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DeliveryAnnouncementRead" ADD CONSTRAINT "DeliveryAnnouncementRead_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "DeliveryCustomerAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
