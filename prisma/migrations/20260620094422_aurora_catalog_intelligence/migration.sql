-- CreateTable
CREATE TABLE "public"."ProductCategory" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductCategoryAssignment" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductCategoryAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductTag" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductTagAssignment" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "ProductTagAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SkinConcern" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkinConcern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductConcern" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "concernId" TEXT NOT NULL,
    "strength" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ProductConcern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductBenefit" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductBenefit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Ingredient" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductIngredient" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "role" TEXT,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RoutineStep" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoutineStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductRoutineStep" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "routineStepId" TEXT NOT NULL,
    "usageNote" TEXT,
    "timeOfDay" TEXT,

    CONSTRAINT "ProductRoutineStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_storeId_slug_key" ON "public"."ProductCategory"("storeId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategoryAssignment_productId_categoryId_key" ON "public"."ProductCategoryAssignment"("productId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductTag_storeId_slug_key" ON "public"."ProductTag"("storeId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProductTagAssignment_productId_tagId_key" ON "public"."ProductTagAssignment"("productId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "SkinConcern_storeId_slug_key" ON "public"."SkinConcern"("storeId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProductConcern_productId_concernId_key" ON "public"."ProductConcern"("productId", "concernId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductBenefit_productId_slug_key" ON "public"."ProductBenefit"("productId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Ingredient_storeId_slug_key" ON "public"."Ingredient"("storeId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProductIngredient_productId_ingredientId_key" ON "public"."ProductIngredient"("productId", "ingredientId");

-- CreateIndex
CREATE UNIQUE INDEX "RoutineStep_storeId_slug_key" ON "public"."RoutineStep"("storeId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProductRoutineStep_productId_routineStepId_key" ON "public"."ProductRoutineStep"("productId", "routineStepId");

-- AddForeignKey
ALTER TABLE "public"."ProductCategory" ADD CONSTRAINT "ProductCategory_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductCategoryAssignment" ADD CONSTRAINT "ProductCategoryAssignment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductCategoryAssignment" ADD CONSTRAINT "ProductCategoryAssignment_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."ProductCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductTag" ADD CONSTRAINT "ProductTag_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductTagAssignment" ADD CONSTRAINT "ProductTagAssignment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductTagAssignment" ADD CONSTRAINT "ProductTagAssignment_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."ProductTag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SkinConcern" ADD CONSTRAINT "SkinConcern_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductConcern" ADD CONSTRAINT "ProductConcern_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductConcern" ADD CONSTRAINT "ProductConcern_concernId_fkey" FOREIGN KEY ("concernId") REFERENCES "public"."SkinConcern"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductBenefit" ADD CONSTRAINT "ProductBenefit_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ingredient" ADD CONSTRAINT "Ingredient_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductIngredient" ADD CONSTRAINT "ProductIngredient_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductIngredient" ADD CONSTRAINT "ProductIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "public"."Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RoutineStep" ADD CONSTRAINT "RoutineStep_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductRoutineStep" ADD CONSTRAINT "ProductRoutineStep_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductRoutineStep" ADD CONSTRAINT "ProductRoutineStep_routineStepId_fkey" FOREIGN KEY ("routineStepId") REFERENCES "public"."RoutineStep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
