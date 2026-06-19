import { Module } from '@nestjs/common';
import { InventoryController } from './controllers/inventory.controller';
import { InventoryService } from './services/inventory.service';
import { PrismaInventoryRepository } from './infrastructure/prisma-inventory.repository';
import { INVENTORY_REPOSITORY } from './inventory.tokens';
import { OutboxModule } from '../shared/infrastructure/outbox/outbox.module';

@Module({
  imports: [OutboxModule],
  controllers: [InventoryController],
  providers: [
    InventoryService,
    PrismaInventoryRepository,
    {
      provide: INVENTORY_REPOSITORY,
      useExisting: PrismaInventoryRepository,
    },
  ],
  exports: [InventoryService, INVENTORY_REPOSITORY],
})
export class InventoryModule {}
