-- AlterTable
ALTER TABLE "public"."Cart" ADD COLUMN     "couponCodeId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Cart" ADD CONSTRAINT "Cart_couponCodeId_fkey" FOREIGN KEY ("couponCodeId") REFERENCES "public"."CouponCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
