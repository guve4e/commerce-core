import { Module } from '@nestjs/common';
import { OrderController } from './controllers/order.controller';
import { OrderService } from './services/order.service';
import { OrderApplicationService } from './application/order-application.service';


@Module({
  controllers: [OrderController],
  providers: [OrderService, OrderApplicationService],
  exports: [OrderService, OrderApplicationService],
})
export class OrderModule {}
