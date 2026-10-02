-- Cash receipts issued from sales invoices for cash collections.
CREATE TABLE "CashReceipt" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "receiptNo" TEXT NOT NULL,
    "receiptDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "currency" "CurrencyCode" NOT NULL DEFAULT 'RON',
    "paymentType" "PaymentType" NOT NULL DEFAULT 'CASH',
    "payerName" TEXT NOT NULL,
    "payerCif" TEXT,
    "payerAddress" TEXT,
    "invoiceDocNo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashReceipt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CashReceipt_invoiceId_key" ON "CashReceipt"("invoiceId");
CREATE UNIQUE INDEX "CashReceipt_tenantId_companyId_receiptNo_key" ON "CashReceipt"("tenantId", "companyId", "receiptNo");
CREATE INDEX "CashReceipt_tenantId_companyId_receiptDate_idx" ON "CashReceipt"("tenantId", "companyId", "receiptDate");
CREATE INDEX "CashReceipt_invoiceId_idx" ON "CashReceipt"("invoiceId");

ALTER TABLE "CashReceipt" ADD CONSTRAINT "CashReceipt_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "SalesInvoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
