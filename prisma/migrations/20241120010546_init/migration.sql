-- CreateTable
CREATE TABLE "fxql_statements" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "source_currency" VARCHAR(255) NOT NULL,
    "destination_currency" VARCHAR(255) NOT NULL,
    "sell_price" DOUBLE PRECISION NOT NULL,
    "buy_price" DOUBLE PRECISION NOT NULL,
    "cap_amount" INTEGER NOT NULL,

    CONSTRAINT "fxql_statements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fxql_statements_source_currency_destination_currency_key" ON "fxql_statements"("source_currency", "destination_currency");
