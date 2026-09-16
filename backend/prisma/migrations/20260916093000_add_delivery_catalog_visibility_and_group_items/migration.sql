ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "isVisibleInDelivery" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "DeliveryProductOptionGroup"
  ADD COLUMN IF NOT EXISTS "allowedItemIds" JSONB;
