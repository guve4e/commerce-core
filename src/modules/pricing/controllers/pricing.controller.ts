import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { SetDefaultPriceDto } from '../dto/set-default-price.dto';
import { PricingService } from '../services/pricing.service';

@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post('default-price')
  setDefaultPrice(@Body() dto: SetDefaultPriceDto) {
    return this.pricingService.setDefaultPrice(dto);
  }

  @Get('stores/:storeId/variants/:variantId/resolve')
  resolvePrice(
    @Param('storeId') storeId: string,
    @Param('variantId') variantId: string,
    @Query('currency') currency: string,
  ) {
    return this.pricingService.resolveActivePrice(storeId, variantId, currency);
  }
}
