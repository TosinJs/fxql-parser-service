-- CreateTable
CREATE TABLE "exchange_rates" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "source_currency" VARCHAR(3) NOT NULL,
    "destination_currency" VARCHAR(3) NOT NULL,
    "sell_price" DOUBLE PRECISION NOT NULL,
    "buy_price" DOUBLE PRECISION NOT NULL,
    "cap_amount" INTEGER NOT NULL,

    CONSTRAINT "exchange_rates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exchange_rates_source_currency_destination_currency_key" ON "exchange_rates"("source_currency", "destination_currency");
