import { Module } from '@nestjs/common';

import { LegacyVisitorController } from './controllers/legacy-visitor.controller';
import { LegacyVisitorService } from './services/legacy-visitor.service';

import { LegacyProductController } from './controllers/legacy-product.controller';
import { LegacyProductService } from './services/legacy-product.service';

import { LegacyCartController } from './controllers/legacy-cart.controller';
import { LegacyCartService } from './services/legacy-cart.service';

@Module({
  controllers: [
    LegacyVisitorController,
    LegacyProductController,
    LegacyCartController,
  ],
  providers: [
    LegacyVisitorService,
    LegacyProductService,
    LegacyCartService,
  ],
})
export class LegacyModule {}
