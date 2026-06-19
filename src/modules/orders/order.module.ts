import { Module } from '@nestjs/common';
import { OrderController } from './controllers/order.controller';
import { OrderService } from './services/order.service';
import { OrderApplicationService } from './application/order-application.service';
import { InventoryModule } from '../inventory/inventory.module';
import { OutboxModule } from '../shared/infrastructure/outbox/outbox.module';
import { PrismaOrderRepository } from './infrastructure/prisma-order.repository';
import { ORDER_REPOSITORY } from './order.tokens';

@Module({
  imports: [InventoryModule, OutboxModule],
  controllers: [OrderController],
  providers: [
    OrderService,
    OrderApplicationService,
    PrismaOrderRepository,
    {
      provide: ORDER_REPOSITORY,
      useExisting: PrismaOrderRepository,
    },
  ],
  exports: [OrderService, OrderApplicationService, ORDER_REPOSITORY],
})
export class OrderModule {}
