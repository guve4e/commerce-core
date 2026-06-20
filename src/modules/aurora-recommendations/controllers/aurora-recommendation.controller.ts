import { Controller, Get, Param } from '@nestjs/common';
import { AuroraRecommendationService } from '../services/aurora-recommendation.service';

@Controller('aurora/recommendations')
export class AuroraRecommendationController {
  constructor(
    private readonly auroraRecommendationService: AuroraRecommendationService,
  ) {}

  @Get('customer/:customerId')
  recommendForCustomer(@Param('customerId') customerId: string) {
    return this.auroraRecommendationService.recommendForCustomer(customerId);
  }
}
