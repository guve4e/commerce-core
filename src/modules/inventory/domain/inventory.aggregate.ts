export class InventoryAggregate {
  constructor(
    private readonly inventory: {
      quantity: number;
      reservedQuantity: number;
    },
  ) {}

  reserve(qty: number) {
    this.assertPositive(qty);

    if (this.available < qty) {
      throw new Error('Insufficient available inventory');
    }

    this.inventory.reservedQuantity += qty;
  }

  consume(qty: number) {
    this.assertPositive(qty);

    if (this.inventory.reservedQuantity < qty) {
      throw new Error(
        'Cannot consume more than reserved inventory',
      );
    }

    if (this.inventory.quantity < qty) {
      throw new Error(
        'Cannot consume more than total inventory',
      );
    }

    this.inventory.quantity -= qty;
    this.inventory.reservedQuantity -= qty;
  }

  release(qty: number) {
    this.assertPositive(qty);

    if (this.inventory.reservedQuantity < qty) {
      throw new Error(
        'Cannot release more than reserved inventory',
      );
    }

    this.inventory.reservedQuantity -= qty;
  }

  restock(qty: number) {
    this.assertPositive(qty);

    this.inventory.quantity += qty;
  }

  get quantity() {
    return this.inventory.quantity;
  }

  get reservedQuantity() {
    return this.inventory.reservedQuantity;
  }

  get available() {
    return this.inventory.quantity - this.inventory.reservedQuantity;
  }

  private assertPositive(qty: number) {
    if (!Number.isFinite(qty) || qty <= 0) {
      throw new Error(
        'Quantity must be positive',
      );
    }
  }
}
