-- AlterTable
ALTER TABLE "products" ADD COLUMN "weight" DECIMAL(8,3) NOT NULL DEFAULT 0.5;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN "subtotal" DECIMAL(10,2);
ALTER TABLE "orders" ADD COLUMN "shipping_cost" DECIMAL(10,2) NOT NULL DEFAULT 0;

UPDATE "orders" SET "subtotal" = "total" WHERE "subtotal" IS NULL;

ALTER TABLE "orders" ALTER COLUMN "subtotal" SET NOT NULL;

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('pending', 'in_transit', 'delivered');

-- CreateTable
CREATE TABLE "carriers" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carriers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "carriers_slug_key" ON "carriers"("slug");

-- CreateTable
CREATE TABLE "shipping_methods" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "price_multiplier" DECIMAL(4,2) NOT NULL,
    "days_base" INTEGER NOT NULL,
    "km_per_day" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "carrierId" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_methods_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "shipping_methods_carrierId_code_key" ON "shipping_methods"("carrierId", "code");

ALTER TABLE "shipping_methods" ADD CONSTRAINT "shipping_methods_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "carriers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "shipments" (
    "id" UUID NOT NULL,
    "carrier_name" TEXT NOT NULL,
    "method_name" TEXT NOT NULL,
    "method_code" TEXT NOT NULL,
    "cost" DECIMAL(10,2) NOT NULL,
    "estimated_days" INTEGER NOT NULL,
    "destination_cep" VARCHAR(9) NOT NULL,
    "distance_km" DECIMAL(8,1),
    "tracking_code" TEXT,
    "status" "ShipmentStatus" NOT NULL DEFAULT 'pending',
    "orderId" UUID NOT NULL,
    "shippingMethodId" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "shipments_orderId_key" ON "shipments"("orderId");

ALTER TABLE "shipments" ADD CONSTRAINT "shipments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_shippingMethodId_fkey" FOREIGN KEY ("shippingMethodId") REFERENCES "shipping_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;
