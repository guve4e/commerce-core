-- CreateTable
CREATE TABLE "public"."ProductTranslation" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT,
    "description" TEXT,
    "keyIngredients" TEXT,
    "fullIngredients" TEXT,
    "directions" TEXT,
    "warnings" TEXT,
    "whatToExpect" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductImage" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PriceList" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VariantPrice" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "priceListId" TEXT NOT NULL,
    "regularPrice" DECIMAL(65,30) NOT NULL,
    "compareAtPrice" DECIMAL(65,30),
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VariantPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Promotion" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "discountType" TEXT NOT NULL,
    "discountValue" DECIMAL(65,30),
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PromotionVariant" (
    "id" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "salePrice" DECIMAL(65,30),
    "discountPercent" DECIMAL(65,30),
    "fixedDiscount" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromotionVariant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductTranslation_locale_idx" ON "public"."ProductTranslation"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "ProductTranslation_productId_locale_key" ON "public"."ProductTranslation"("productId", "locale");

-- CreateIndex
CREATE INDEX "ProductImage_productId_type_idx" ON "public"."ProductImage"("productId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "PriceList_storeId_name_currency_key" ON "public"."PriceList"("storeId", "name", "currency");

-- CreateIndex
CREATE INDEX "VariantPrice_variantId_idx" ON "public"."VariantPrice"("variantId");

-- CreateIndex
CREATE INDEX "VariantPrice_priceListId_idx" ON "public"."VariantPrice"("priceListId");

-- CreateIndex
CREATE INDEX "VariantPrice_active_startsAt_endsAt_idx" ON "public"."VariantPrice"("active", "startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "Promotion_storeId_status_idx" ON "public"."Promotion"("storeId", "status");

-- CreateIndex
CREATE INDEX "Promotion_startsAt_endsAt_idx" ON "public"."Promotion"("startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "PromotionVariant_variantId_idx" ON "public"."PromotionVariant"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionVariant_promotionId_variantId_key" ON "public"."PromotionVariant"("promotionId", "variantId");

-- AddForeignKey
ALTER TABLE "public"."ProductTranslation" ADD CONSTRAINT "ProductTranslation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PriceList" ADD CONSTRAINT "PriceList_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VariantPrice" ADD CONSTRAINT "VariantPrice_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "public"."ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VariantPrice" ADD CONSTRAINT "VariantPrice_priceListId_fkey" FOREIGN KEY ("priceListId") REFERENCES "public"."PriceList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Promotion" ADD CONSTRAINT "Promotion_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromotionVariant" ADD CONSTRAINT "PromotionVariant_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "public"."Promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromotionVariant" ADD CONSTRAINT "PromotionVariant_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "public"."ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
