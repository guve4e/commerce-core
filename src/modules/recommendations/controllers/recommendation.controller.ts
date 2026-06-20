import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RecommendationService } from '../services/recommendation.service';
import { CreateRecommendationDto } from '../dto/create-recommendation.dto';

@Controller('recommendations')
export class RecommendationController {
  constructor(
    private readonly recommendationService: RecommendationService,
  ) {}

  @Post()
  create(@Body() dto: CreateRecommendationDto) {
    return this.recommendationService.createRecommendation(dto);
  }

  @Get(':productId')
  findForProduct(
    @Param('productId') productId: string,
  ) {
    return this.recommendationService.findForProduct(productId);
  }
}
