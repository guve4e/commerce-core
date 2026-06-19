import { Module } from '@nestjs/common';
import { CouponController } from './controllers/coupon.controller';
import { CouponService } from './services/coupon.service';
import { PrismaCouponRepository } from './infrastructure/prisma-coupon.repository';
import { COUPON_REPOSITORY } from './coupon.tokens';

@Module({
  controllers: [CouponController],
  providers: [
    CouponService,
    PrismaCouponRepository,
    {
      provide: COUPON_REPOSITORY,
      useExisting: PrismaCouponRepository,
    },
  ],
  exports: [CouponService, COUPON_REPOSITORY],
})
export class CouponModule {}
