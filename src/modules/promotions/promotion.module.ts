import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PromotionController } from './controllers/promotion.controller';
import { PrismaPromotionRepository } from './infrastructure/prisma-promotion.repository';
import { PromotionService } from './services/promotion.service';
import { PROMOTION_REPOSITORY } from './promotions.tokens';

@Module({
  imports: [PrismaModule],
  controllers: [PromotionController],
  providers: [
    PrismaPromotionRepository,
    {
      provide: PROMOTION_REPOSITORY,
      useExisting: PrismaPromotionRepository,
    },
    PromotionService,
  ],
  exports: [PromotionService, PROMOTION_REPOSITORY],
})
export class PromotionModule {}
