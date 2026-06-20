-- CreateTable
CREATE TABLE "public"."ProductRecommendation" (
    "id" TEXT NOT NULL,
    "sourceProductId" TEXT NOT NULL,
    "targetProductId" TEXT NOT NULL,
    "reason" TEXT,
    "weight" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductBundle" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductBundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductBundleItem" (
    "id" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductBundleItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductRecommendation_sourceProductId_idx" ON "public"."ProductRecommendation"("sourceProductId");

-- CreateIndex
CREATE INDEX "ProductRecommendation_targetProductId_idx" ON "public"."ProductRecommendation"("targetProductId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductRecommendation_sourceProductId_targetProductId_key" ON "public"."ProductRecommendation"("sourceProductId", "targetProductId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductBundle_storeId_slug_key" ON "public"."ProductBundle"("storeId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProductBundleItem_bundleId_variantId_key" ON "public"."ProductBundleItem"("bundleId", "variantId");

-- AddForeignKey
ALTER TABLE "public"."ProductRecommendation" ADD CONSTRAINT "ProductRecommendation_sourceProductId_fkey" FOREIGN KEY ("sourceProductId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductRecommendation" ADD CONSTRAINT "ProductRecommendation_targetProductId_fkey" FOREIGN KEY ("targetProductId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductBundle" ADD CONSTRAINT "ProductBundle_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductBundleItem" ADD CONSTRAINT "ProductBundleItem_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "public"."ProductBundle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductBundleItem" ADD CONSTRAINT "ProductBundleItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "public"."ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
