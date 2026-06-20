import { OrderApplicationService } from './order-application.service';
import { InventoryService } from '../../inventory/services/inventory.service';
import { Outbox } from '../../shared/application/outbox';

describe('OrderApplicationService', () => {
  it('creates order, reserves inventory, checks out cart, and stores order.created event', async () => {
    const cart = makeCart();
    const order = makeOrder();

    const prisma = {
      cart: {
        findFirst: jest.fn().mockResolvedValue(cart),
      },
      $transaction: jest.fn(async (callback) =>
        callback({
          order: {
            create: jest.fn().mockResolvedValue(order),
          },
          cart: {
            update: jest.fn().mockResolvedValue({}),
          },
        }),
      ),
    };

    const inventoryService = {
      reserve: jest.fn(),
    } as unknown as InventoryService;

    const pricingService = {
      resolveActivePrice: jest.fn().mockResolvedValue({
        variantId: 'variant_1',
        currency: 'EUR',
        regularPrice: 50,
        compareAtPrice: null,
        finalPrice: 50,
        source: 'default',
        promotionId: null,
      }),
    };

    const outbox: Outbox = {
      store: jest.fn(),
    };

    const service = new OrderApplicationService(
      prisma as any,
      inventoryService,
      pricingService as any,
      outbox,
    );

    const result = await service.createOrder({
      customerId: 'customer_1',
      addressLine1: 'Main Street 1',
      city: 'Vidin',
      country: 'BG',
      shipping: '5',
      tax: '0',
      currency: 'EUR',
    });

    expect(result).toBe(order);

    expect(pricingService.resolveActivePrice).toHaveBeenCalledWith(
      'store_1',
      'variant_1',
      'EUR',
    );

    expect(inventoryService.reserve).toHaveBeenCalledWith('variant_1', 2);

    expect(outbox.store).toHaveBeenCalledWith([
      expect.objectContaining({
        eventName: 'order.created',
        aggregateId: 'order_1',
        payload: {
          orderId: 'order_1',
          orderNumber: 1001,
          storeId: 'store_1',
          customerId: 'customer_1',
          total: 105,
          currency: 'EUR',
        },
      }),
    ]);
  });

  it('rejects missing active cart', async () => {
    const prisma = {
      cart: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
    };

    const service = makeService(prisma);

    await expect(
      service.createOrder({
        customerId: 'customer_1',
      }),
    ).rejects.toThrow('Active cart not found');
  });

  it('rejects empty cart', async () => {
    const prisma = {
      cart: {
        findFirst: jest.fn().mockResolvedValue({
          ...makeCart(),
          items: [],
        }),
      },
    };

    const service = makeService(prisma);

    await expect(
      service.createOrder({
        customerId: 'customer_1',
      }),
    ).rejects.toThrow('Cart is empty');
  });

  it('rejects insufficient inventory', async () => {
    const cart = makeCart();
    cart.items[0].variant.inventoryItem.quantity = 1;

    const prisma = {
      cart: {
        findFirst: jest.fn().mockResolvedValue(cart),
      },
    };

    const service = makeService(prisma);

    await expect(
      service.createOrder({
        customerId: 'customer_1',
      }),
    ).rejects.toThrow('Insufficient inventory for SKU SKU-1');
  });
});

function makeService(prisma: any) {
  return new OrderApplicationService(
    prisma as any,
    { reserve: jest.fn() } as unknown as InventoryService,
    {
      resolveActivePrice: jest.fn().mockResolvedValue({
        variantId: 'variant_1',
        currency: 'EUR',
        regularPrice: 50,
        compareAtPrice: null,
        finalPrice: 50,
        source: 'default',
        promotionId: null,
      }),
    } as any,
    { store: jest.fn() },
  );
}

function makeCart() {
  return {
    id: 'cart_1',
    customerId: 'customer_1',
    customer: {
      id: 'customer_1',
      storeId: 'store_1',
      email: 'customer@example.com',
      firstName: 'Val',
      lastName: 'K',
      phone: null,
    },
    items: [
      {
        variantId: 'variant_1',
        quantity: 2,
        variant: {
          id: 'variant_1',
          sku: 'SKU-1',
          name: 'Serum',
          price: null,
          inventoryItem: {
            quantity: 10,
            reservedQuantity: 0,
          },
          product: {
            id: 'product_1',
          },
        },
      },
    ],
  };
}

function makeOrder() {
  return {
    id: 'order_1',
    orderNumber: 1001,
    storeId: 'store_1',
    customerId: 'customer_1',
    total: '105',
  };
}
