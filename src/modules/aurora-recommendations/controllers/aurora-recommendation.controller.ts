import { Controller, Get, Param, Query } from '@nestjs/common';
import { AuroraRecommendationService } from '../services/aurora-recommendation.service';

@Controller('aurora/recommendations')
export class AuroraRecommendationController {
  constructor(
    private readonly auroraRecommendationService: AuroraRecommendationService,
  ) {}

  @Get('customer/:customerId')
  recommendForCustomer(
    @Param('customerId') customerId: string,
    @Query('currency') currency = 'EUR',
    @Query('maxPrice') maxPrice?: string,
  ) {
    return this.auroraRecommendationService.recommendForCustomer(
      customerId,
      currency,
      maxPrice ? Number(maxPrice) : undefined,
    );
  }

  @Get('customer/:customerId/routine')
  buildRoutineForCustomer(
    @Param('customerId') customerId: string,
    @Query('currency') currency = 'EUR',
    @Query('maxTotal') maxTotal?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auroraRecommendationService.buildRoutineForCustomer(
      customerId,
      currency,
      maxTotal ? Number(maxTotal) : undefined,
      limit ? Number(limit) : 3,
    );
  }
}
