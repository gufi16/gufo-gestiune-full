ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "deliveryDescription" TEXT,
  ADD COLUMN IF NOT EXISTS "deliveryPromoPrice" DECIMAL(12,2);
