import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrismaPricingRepository } from './infrastructure/prisma-pricing.repository';
import { PRICING_REPOSITORY } from './pricing.tokens';
import { PricingService } from './services/pricing.service';
import { PricingController } from './controllers/pricing.controller';

@Module({
  imports: [PrismaModule],
  controllers: [PricingController],
  providers: [
    PrismaPricingRepository,
    {
      provide: PRICING_REPOSITORY,
      useExisting: PrismaPricingRepository,
    },
    PricingService,
  ],
  exports: [PRICING_REPOSITORY, PrismaPricingRepository, PricingService],
})
export class PricingModule {}
