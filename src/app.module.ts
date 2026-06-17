import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { CatalogModule } from './modules/catalog/catalog.module';
import { PrismaModule } from './prisma/prisma.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { CartModule } from './modules/carts/cart.module';
import { CustomerModule } from './modules/customers/customer.module';
import { OrderModule } from './modules/orders/order.module';
import { PaymentModule } from './modules/payments/payment.module';
import { ShipmentModule } from './modules/shipments/shipment.module';
import { ReturnModule } from './modules/returns/return.module';
import { CouponModule } from './modules/coupons/coupon.module';
import { AttributionModule } from './modules/attribution/attribution.module';
import { AuthModule } from './modules/auth/auth.module';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { StoreModule } from './modules/stores/store.module';

@Module({
  imports: [
    PrismaModule,
    CatalogModule,
    InventoryModule,
    CartModule,
    CustomerModule,
    OrderModule,
    PaymentModule,
    ShipmentModule,
    ReturnModule,
    CouponModule,
    AttributionModule,
    AuthModule,
    CheckoutModule,
    StoreModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
