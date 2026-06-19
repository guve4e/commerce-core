import { InventoryAggregate } from '../../inventory/domain/inventory.aggregate';
import { OrderAggregate } from '../domain/order.aggregate';
import { ShipOrderApplicationService } from './ship-order.application-service';

describe('ShipOrderApplicationService', () => {
  it('ships order and consumes inventory for each item', async () => {
    const order = new OrderAggregate({
      id: 'order_1',
      orderNumber: 1001,
      status: 'processing',
    });

    const inventory = new InventoryAggregate({
      id: 'inventory_1',
      quantity: 25,
      reservedQuantity: 3,
    });

    const orderRepository = {
      findById: jest.fn().mockResolvedValue(order),
      findByOrderNumber: jest.fn(),
      save: jest.fn(),
    };

    const inventoryRepository = {
      findById: jest.fn(),
      findByVariantId: jest.fn().mockResolvedValue(inventory),
      save: jest.fn(),
    };

    const orderItemReader = {
      findItemsForFulfillment: jest.fn().mockResolvedValue([
        {
          id: 'item_1',
          variantId: 'variant_1',
          quantity: 3,
        },
      ]),
    };

    const service = new ShipOrderApplicationService(
      orderRepository,
      inventoryRepository,
      orderItemReader,
    );

    const result = await service.execute({
      orderId: 'order_1',
    });

    expect(order.status).toBe('shipped');
    expect(inventory.snapshot()).toEqual({
      id: 'inventory_1',
      quantity: 22,
      reservedQuantity: 0,
    });

    expect(orderRepository.save).toHaveBeenCalledWith(order);
    expect(inventoryRepository.save).toHaveBeenCalledWith(inventory);

    expect(result).toEqual({
      order,
      itemsProcessed: 1,
    });
  });

  it('throws when order is missing', async () => {
    const service = new ShipOrderApplicationService(
      {
        findById: jest.fn().mockResolvedValue(null),
        findByOrderNumber: jest.fn(),
        save: jest.fn(),
      },
      {
        findById: jest.fn(),
        findByVariantId: jest.fn(),
        save: jest.fn(),
      },
      {
        findItemsForFulfillment: jest.fn(),
      },
    );

    await expect(service.execute({ orderId: 'missing' })).rejects.toThrow(
      'Order not found',
    );
  });

  it('throws when order item has no variant id', async () => {
    const order = new OrderAggregate({
      id: 'order_1',
      orderNumber: 1001,
      status: 'processing',
    });

    const service = new ShipOrderApplicationService(
      {
        findById: jest.fn().mockResolvedValue(order),
        findByOrderNumber: jest.fn(),
        save: jest.fn(),
      },
      {
        findById: jest.fn(),
        findByVariantId: jest.fn(),
        save: jest.fn(),
      },
      {
        findItemsForFulfillment: jest.fn().mockResolvedValue([
          {
            id: 'item_1',
            variantId: null,
            quantity: 3,
          },
        ]),
      },
    );

    await expect(service.execute({ orderId: 'order_1' })).rejects.toThrow(
      'Order item item_1 has no variantId',
    );
  });

  it('throws when inventory is missing', async () => {
    const order = new OrderAggregate({
      id: 'order_1',
      orderNumber: 1001,
      status: 'processing',
    });

    const service = new ShipOrderApplicationService(
      {
        findById: jest.fn().mockResolvedValue(order),
        findByOrderNumber: jest.fn(),
        save: jest.fn(),
      },
      {
        findById: jest.fn(),
        findByVariantId: jest.fn().mockResolvedValue(null),
        save: jest.fn(),
      },
      {
        findItemsForFulfillment: jest.fn().mockResolvedValue([
          {
            id: 'item_1',
            variantId: 'variant_1',
            quantity: 3,
          },
        ]),
      },
    );

    await expect(service.execute({ orderId: 'order_1' })).rejects.toThrow(
      'Inventory not found for variant variant_1',
    );
  });
});
