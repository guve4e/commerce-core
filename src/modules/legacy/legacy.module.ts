import { Module } from '@nestjs/common';
import { LegacyVisitorController } from './controllers/legacy-visitor.controller';
import { LegacyVisitorService } from './services/legacy-visitor.service';
import { LegacyProductController } from './controllers/legacy-product.controller';
import { LegacyProductService } from './services/legacy-product.service';

@Module({
  controllers: [
    LegacyVisitorController,
    LegacyProductController,
  ],
  providers: [
    LegacyVisitorService,
    LegacyProductService,
  ],
})
export class LegacyModule {}
