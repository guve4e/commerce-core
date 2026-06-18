import { InventoryAggregate } from './inventory.aggregate';

describe('InventoryAggregate', () => {
  it('reserves available stock', () => {
    const inventory = new InventoryAggregate({
      quantity: 25,
      reservedQuantity: 0,
    });

    inventory.reserve(3);

    expect(inventory.quantity).toBe(25);
    expect(inventory.reservedQuantity).toBe(3);
  });

  it('consumes reserved stock when shipped', () => {
    const inventory = new InventoryAggregate({
      quantity: 25,
      reservedQuantity: 3,
    });

    inventory.consume(3);

    expect(inventory.quantity).toBe(22);
    expect(inventory.reservedQuantity).toBe(0);
  });

  it('releases reserved stock when cancelled', () => {
    const inventory = new InventoryAggregate({
      quantity: 25,
      reservedQuantity: 3,
    });

    inventory.release(3);

    expect(inventory.quantity).toBe(25);
    expect(inventory.reservedQuantity).toBe(0);
  });

  it('restocks returned stock', () => {
    const inventory = new InventoryAggregate({
      quantity: 22,
      reservedQuantity: 0,
    });

    inventory.restock(1);

    expect(inventory.quantity).toBe(23);
    expect(inventory.reservedQuantity).toBe(0);
  });

  it('does not reserve more than available', () => {
    const inventory = new InventoryAggregate({
      quantity: 5,
      reservedQuantity: 3,
    });

    expect(() => inventory.reserve(3)).toThrow();
  });

  it('does not consume more than reserved', () => {
    const inventory = new InventoryAggregate({
      quantity: 25,
      reservedQuantity: 2,
    });

    expect(() => inventory.consume(3)).toThrow();
  });

  it('does not release more than reserved', () => {
    const inventory = new InventoryAggregate({
      quantity: 25,
      reservedQuantity: 2,
    });

    expect(() => inventory.release(3)).toThrow();
  });
});
