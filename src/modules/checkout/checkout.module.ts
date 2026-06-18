import { Module } from '@nestjs/common';
import { OrderModule } from '../orders/order.module';
import { CheckoutController } from './controllers/checkout.controller';
import { CheckoutService } from './services/checkout.service';

@Module({
  imports: [OrderModule],
  controllers: [CheckoutController],
  providers: [CheckoutService],
  exports: [CheckoutService],
})
export class CheckoutModule {}
