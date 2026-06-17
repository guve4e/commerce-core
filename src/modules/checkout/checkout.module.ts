import { Module } from '@nestjs/common';
import { CheckoutController } from './controllers/checkout.controller';
import { CheckoutService } from './services/checkout.service';

@Module({
  controllers: [CheckoutController],
  providers: [CheckoutService],
  exports: [CheckoutService],
})
export class CheckoutModule {}
