-- CreateTable
CREATE TABLE "public"."CustomerProfile" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "ageRange" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CustomerProfileSkinType" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "skinTypeId" TEXT NOT NULL,
    "strength" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "CustomerProfileSkinType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CustomerProfileConcern" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "concernId" TEXT NOT NULL,
    "severity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "CustomerProfileConcern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CustomerProfileSensitivity" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "note" TEXT,

    CONSTRAINT "CustomerProfileSensitivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerProfile_customerId_key" ON "public"."CustomerProfile"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerProfileSkinType_profileId_skinTypeId_key" ON "public"."CustomerProfileSkinType"("profileId", "skinTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerProfileConcern_profileId_concernId_key" ON "public"."CustomerProfileConcern"("profileId", "concernId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerProfileSensitivity_profileId_ingredientId_key" ON "public"."CustomerProfileSensitivity"("profileId", "ingredientId");

-- AddForeignKey
ALTER TABLE "public"."CustomerProfile" ADD CONSTRAINT "CustomerProfile_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CustomerProfileSkinType" ADD CONSTRAINT "CustomerProfileSkinType_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."CustomerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CustomerProfileSkinType" ADD CONSTRAINT "CustomerProfileSkinType_skinTypeId_fkey" FOREIGN KEY ("skinTypeId") REFERENCES "public"."SkinType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CustomerProfileConcern" ADD CONSTRAINT "CustomerProfileConcern_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."CustomerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CustomerProfileConcern" ADD CONSTRAINT "CustomerProfileConcern_concernId_fkey" FOREIGN KEY ("concernId") REFERENCES "public"."SkinConcern"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CustomerProfileSensitivity" ADD CONSTRAINT "CustomerProfileSensitivity_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."CustomerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CustomerProfileSensitivity" ADD CONSTRAINT "CustomerProfileSensitivity_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "public"."Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
