-- AlterTable
ALTER TABLE "carriers" ADD COLUMN "hub_lat" DECIMAL(10,7);
ALTER TABLE "carriers" ADD COLUMN "hub_lng" DECIMAL(10,7);

UPDATE "carriers"
SET "hub_lat" = -23.5500000,
    "hub_lng" = -46.6330000
WHERE "hub_lat" IS NULL;

ALTER TABLE "carriers" ALTER COLUMN "hub_lat" SET NOT NULL;
ALTER TABLE "carriers" ALTER COLUMN "hub_lng" SET NOT NULL;

-- AlterTable
ALTER TABLE "shipping_methods" ADD COLUMN "base_price" DECIMAL(10,2);
ALTER TABLE "shipping_methods" ADD COLUMN "price_per_km" DECIMAL(8,4);
ALTER TABLE "shipping_methods" ADD COLUMN "price_per_kg" DECIMAL(8,4);

UPDATE "shipping_methods"
SET "base_price" = 14.00,
    "price_per_km" = 0.0220,
    "price_per_kg" = 1.5000
WHERE "code" = 'pac';

UPDATE "shipping_methods"
SET "base_price" = 18.00,
    "price_per_km" = 0.0320,
    "price_per_kg" = 2.0000
WHERE "code" = 'sedex';

UPDATE "shipping_methods"
SET "base_price" = 28.00,
    "price_per_km" = 0.0550,
    "price_per_kg" = 3.0000
WHERE "code" = 'express';

UPDATE "shipping_methods"
SET "base_price" = COALESCE("base_price", 14.00),
    "price_per_km" = COALESCE("price_per_km", 0.0220),
    "price_per_kg" = COALESCE("price_per_kg", 1.5000)
WHERE "base_price" IS NULL;

ALTER TABLE "shipping_methods" ALTER COLUMN "base_price" SET NOT NULL;
ALTER TABLE "shipping_methods" ALTER COLUMN "price_per_km" SET NOT NULL;
ALTER TABLE "shipping_methods" ALTER COLUMN "price_per_kg" SET NOT NULL;

ALTER TABLE "shipping_methods" DROP COLUMN "price_multiplier";
