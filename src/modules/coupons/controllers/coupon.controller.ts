import { Body, Controller, Get, Post } from '@nestjs/common';
import { CouponService } from '../services/coupon.service';
import { CreateCampaignDto } from '../dto/create-campaign.dto';
import { CreateCouponCodeDto } from '../dto/create-coupon-code.dto';

@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post('campaigns')
  createCampaign(@Body() dto: CreateCampaignDto) {
    return this.couponService.createCampaign(dto);
  }

  @Get('campaigns')
  findCampaigns() {
    return this.couponService.findCampaigns();
  }

  @Post('codes')
  createCode(@Body() dto: CreateCouponCodeDto) {
    return this.couponService.createCode(dto);
  }

  @Get('codes')
  findCodes() {
    return this.couponService.findCodes();
  }
}
