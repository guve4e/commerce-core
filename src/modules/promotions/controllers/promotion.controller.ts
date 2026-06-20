import { Body, Controller, Param, Post } from '@nestjs/common';
import { CreatePromotionDto } from '../dto/create-promotion.dto';
import { PromotionService } from '../services/promotion.service';

@Controller('promotions')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Post()
  createPromotion(@Body() dto: CreatePromotionDto) {
    return this.promotionService.createPromotion(dto);
  }

  @Post(':id/activate')
  activatePromotion(@Param('id') id: string) {
    return this.promotionService.activatePromotion(id);
  }

  @Post(':id/variants')
  assignVariant(
    @Param('id') promotionId: string,
    @Body()
    body: {
      variantId: string;
      salePrice?: number | null;
      discountPercent?: number | null;
      fixedDiscount?: number | null;
    },
  ) {
    return this.promotionService.assignVariant({
      promotionId,
      ...body,
    });
  }
}
