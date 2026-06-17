/*
  Warnings:

  - A unique constraint covering the columns `[storeId,hash]` on the table `Visitor` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Visitor" ADD COLUMN     "hash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Visitor_storeId_hash_key" ON "public"."Visitor"("storeId", "hash");
