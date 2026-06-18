import { Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { LegacyCartService } from '../services/legacy-cart.service';
import { LegacyCouponService } from '../services/legacy-coupon.service';

@Controller('shoppingCart')
export class LegacyCartController {
  constructor(
    private readonly legacyCartService: LegacyCartService,
    private readonly legacyCouponService: LegacyCouponService,
  ) {}


  @Get('getAvailableQuantities/:userId')
  getAvailableQuantities(@Param('userId') userId: string) {
    return this.legacyCartService.getAvailableQuantities(userId);
  }

  @Get(':userId')
  getCart(@Param('userId') userId: string) {
    return this.legacyCartService.getCart(userId);
  }

  @Post(':userId')
  makeCart(@Param('userId') userId: string) {
    return this.legacyCartService.makeCart(userId);
  }

  @Put('addToShoppingCart/:userId')
  addToCart(
    @Param('userId') userId: string,
    @Query('sku') sku: string,
    @Query('qty') qty: string,
  ) {
    return this.legacyCartService.addToCart(userId, sku, Number(qty));
  }

  @Put('updateShoppingCart/:userId')
  updateCart(
    @Param('userId') userId: string,
    @Query('sku') sku: string,
    @Query('qty') qty: string,
  ) {
    return this.legacyCartService.updateCart(userId, sku, Number(qty));
  }


  @Post('applyCoupon/:userId')
  applyCoupon(
    @Param('userId') userId: string,
    @Query('couponToken') couponToken: string,
  ) {
    return this.legacyCouponService.applyCoupon(userId, couponToken);
  }

  @Delete('deleteShoppingCart/:userId')
  deleteCart(@Param('userId') userId: string) {
    return this.legacyCartService.deleteShoppingCart(userId);
  }
}
