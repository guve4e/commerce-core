import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuroraRecommendationController } from './controllers/aurora-recommendation.controller';
import { AuroraRecommendationService } from './services/aurora-recommendation.service';

@Module({
  imports: [PrismaModule],
  controllers: [AuroraRecommendationController],
  providers: [AuroraRecommendationService],
  exports: [AuroraRecommendationService],
})
export class AuroraRecommendationModule {}
