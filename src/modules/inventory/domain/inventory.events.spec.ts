import { InventoryAggregate } from './inventory.aggregate';

describe('InventoryAggregate domain events', () => {
  it('records inventory.reserved', () => {
    const inventory = new InventoryAggregate({
      id: 'inventory_1',
      quantity: 25,
      reservedQuantity: 0,
    });

    inventory.reserve(3);

    expect(inventory.peekDomainEvents()).toEqual([
      expect.objectContaining({
        eventName: 'inventory.reserved',
        aggregateId: 'inventory_1',
        payload: {
          inventoryId: 'inventory_1',
          quantity: 3,
        },
      }),
    ]);
  });

  it('records inventory.consumed', () => {
    const inventory = new InventoryAggregate({
      id: 'inventory_1',
      quantity: 25,
      reservedQuantity: 3,
    });

    inventory.consume(3);

    expect(inventory.peekDomainEvents()).toEqual([
      expect.objectContaining({
        eventName: 'inventory.consumed',
        aggregateId: 'inventory_1',
        payload: {
          inventoryId: 'inventory_1',
          quantity: 3,
        },
      }),
    ]);
  });

  it('records inventory.released', () => {
    const inventory = new InventoryAggregate({
      id: 'inventory_1',
      quantity: 25,
      reservedQuantity: 3,
    });

    inventory.release(3);

    expect(inventory.peekDomainEvents()).toEqual([
      expect.objectContaining({
        eventName: 'inventory.released',
        aggregateId: 'inventory_1',
        payload: {
          inventoryId: 'inventory_1',
          quantity: 3,
        },
      }),
    ]);
  });

  it('records inventory.restocked', () => {
    const inventory = new InventoryAggregate({
      id: 'inventory_1',
      quantity: 22,
      reservedQuantity: 0,
    });

    inventory.restock(1);

    expect(inventory.peekDomainEvents()).toEqual([
      expect.objectContaining({
        eventName: 'inventory.restocked',
        aggregateId: 'inventory_1',
        payload: {
          inventoryId: 'inventory_1',
          quantity: 1,
        },
      }),
    ]);
  });

  it('does not record inventory events without inventory id', () => {
    const inventory = new InventoryAggregate({
      quantity: 25,
      reservedQuantity: 0,
    });

    inventory.reserve(3);

    expect(inventory.peekDomainEvents()).toEqual([]);
  });
});
