import { OrderRepository } from '../domain/order.repository';
import { InventoryRepository } from '../../inventory/domain/inventory.repository';
import { OrderItemReader } from './order-item-reader';

export interface ShipOrderCommand {
  orderId: string;
}

export class ShipOrderApplicationService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly inventoryRepository: InventoryRepository,
    private readonly orderItemReader: OrderItemReader,
  ) {}

  async execute(command: ShipOrderCommand) {
    const order = await this.orderRepository.findById(command.orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    const items = await this.orderItemReader.findItemsForFulfillment(
      command.orderId,
    );

    order.ship();

    await this.orderRepository.save(order);

    for (const item of items) {
      if (!item.variantId) {
        throw new Error(`Order item ${item.id} has no variantId`);
      }

      const inventory = await this.inventoryRepository.findByVariantId(
        item.variantId,
      );

      if (!inventory) {
        throw new Error(`Inventory not found for variant ${item.variantId}`);
      }

      inventory.consume(item.quantity);

      await this.inventoryRepository.save(inventory);
    }

    return {
      order,
      itemsProcessed: items.length,
    };
  }
}
