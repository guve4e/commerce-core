import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { RecommendationService } from './services/recommendation.service';
import { BundleService } from './services/bundle.service';
import { RecommendationController } from './controllers/recommendation.controller';
import { BundleController } from './controllers/bundle.controller';

@Module({
  imports: [PrismaModule],
  providers: [
    RecommendationService,
    BundleService,
  ],
  controllers: [
    RecommendationController,
    BundleController,
  ],
  exports: [
    RecommendationService,
    BundleService,
  ],
})
export class RecommendationModule {}
