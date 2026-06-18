import { Controller, Get, Param } from '@nestjs/common';
import { LegacyCouponService } from '../services/legacy-coupon.service';

@Controller('coupon')
export class LegacyCouponController {
  constructor(private readonly legacyCouponService: LegacyCouponService) {}

  @Get('getByToken/:token')
  getByToken(@Param('token') token: string) {
    return this.legacyCouponService.getByToken(token);
  }

  @Get('getPublicCoupons/:company')
  getPublicCoupons(@Param('company') company: string) {
    return this.legacyCouponService.getPublicCoupons(company);
  }
}
