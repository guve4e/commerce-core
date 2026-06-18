import { Module } from '@nestjs/common';
import { OrderModule } from '../orders/order.module';

import { LegacyVisitorController } from './controllers/legacy-visitor.controller';
import { LegacyVisitorService } from './services/legacy-visitor.service';

import { LegacyProductController } from './controllers/legacy-product.controller';
import { LegacyProductService } from './services/legacy-product.service';

import { LegacyCartController } from './controllers/legacy-cart.controller';
import { LegacyCartService } from './services/legacy-cart.service';

import { LegacyCouponController } from './controllers/legacy-coupon.controller';
import { LegacyCouponService } from './services/legacy-coupon.service';
import { LegacyOrderController } from './controllers/legacy-order.controller';
import { LegacyOrderService } from './services/legacy-order.service';
import { LegacyReturnController } from './controllers/legacy-return.controller';
import { LegacyReturnService } from './services/legacy-return.service';

@Module({
  imports: [OrderModule],
  controllers: [
    LegacyVisitorController,
    LegacyProductController,
    LegacyCartController,
    LegacyCouponController,
    LegacyOrderController,
    LegacyReturnController,
  ],
  providers: [
    LegacyVisitorService,
    LegacyProductService,
    LegacyCartService,
    LegacyCouponService,
    LegacyOrderService,
    LegacyReturnService,
  ],
})
export class LegacyModule {}
