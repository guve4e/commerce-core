-- CreateTable
CREATE TABLE "public"."Benefit" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Benefit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductBenefitAssignment" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "benefitId" TEXT NOT NULL,
    "strength" INTEGER NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductBenefitAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SkinType" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkinType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductSkinType" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "skinTypeId" TEXT NOT NULL,
    "suitability" TEXT NOT NULL DEFAULT 'suitable',
    "strength" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ProductSkinType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IngredientInteraction" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "ingredientAId" TEXT NOT NULL,
    "ingredientBId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'low',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IngredientInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductInteraction" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "sourceProductId" TEXT NOT NULL,
    "targetProductId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'low',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Contraindication" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contraindication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductContraindication" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "contraindicationId" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "explanation" TEXT,

    CONSTRAINT "ProductContraindication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Benefit_storeId_slug_key" ON "public"."Benefit"("storeId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProductBenefitAssignment_productId_benefitId_key" ON "public"."ProductBenefitAssignment"("productId", "benefitId");

-- CreateIndex
CREATE UNIQUE INDEX "SkinType_storeId_slug_key" ON "public"."SkinType"("storeId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSkinType_productId_skinTypeId_key" ON "public"."ProductSkinType"("productId", "skinTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientInteraction_storeId_ingredientAId_ingredientBId_t_key" ON "public"."IngredientInteraction"("storeId", "ingredientAId", "ingredientBId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "ProductInteraction_storeId_sourceProductId_targetProductId__key" ON "public"."ProductInteraction"("storeId", "sourceProductId", "targetProductId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Contraindication_storeId_slug_key" ON "public"."Contraindication"("storeId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProductContraindication_productId_contraindicationId_key" ON "public"."ProductContraindication"("productId", "contraindicationId");

-- AddForeignKey
ALTER TABLE "public"."Benefit" ADD CONSTRAINT "Benefit_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductBenefitAssignment" ADD CONSTRAINT "ProductBenefitAssignment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductBenefitAssignment" ADD CONSTRAINT "ProductBenefitAssignment_benefitId_fkey" FOREIGN KEY ("benefitId") REFERENCES "public"."Benefit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SkinType" ADD CONSTRAINT "SkinType_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductSkinType" ADD CONSTRAINT "ProductSkinType_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductSkinType" ADD CONSTRAINT "ProductSkinType_skinTypeId_fkey" FOREIGN KEY ("skinTypeId") REFERENCES "public"."SkinType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IngredientInteraction" ADD CONSTRAINT "IngredientInteraction_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IngredientInteraction" ADD CONSTRAINT "IngredientInteraction_ingredientAId_fkey" FOREIGN KEY ("ingredientAId") REFERENCES "public"."Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IngredientInteraction" ADD CONSTRAINT "IngredientInteraction_ingredientBId_fkey" FOREIGN KEY ("ingredientBId") REFERENCES "public"."Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductInteraction" ADD CONSTRAINT "ProductInteraction_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductInteraction" ADD CONSTRAINT "ProductInteraction_sourceProductId_fkey" FOREIGN KEY ("sourceProductId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductInteraction" ADD CONSTRAINT "ProductInteraction_targetProductId_fkey" FOREIGN KEY ("targetProductId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Contraindication" ADD CONSTRAINT "Contraindication_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductContraindication" ADD CONSTRAINT "ProductContraindication_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductContraindication" ADD CONSTRAINT "ProductContraindication_contraindicationId_fkey" FOREIGN KEY ("contraindicationId") REFERENCES "public"."Contraindication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
