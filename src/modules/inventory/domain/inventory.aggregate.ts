import { DomainEventRecorder } from '../../shared/domain/events/domain-event-recorder';
import { InventoryConsumedEvent } from './events/inventory-consumed.event';
import { InventoryReleasedEvent } from './events/inventory-released.event';
import { InventoryReservedEvent } from './events/inventory-reserved.event';
import { InventoryRestockedEvent } from './events/inventory-restocked.event';

export class InventoryAggregate extends DomainEventRecorder {
  constructor(
    private readonly inventory: {
      id?: string;
      quantity: number;
      reservedQuantity: number;
    },
  ) {
    super();
  }

  reserve(qty: number) {
    this.assertPositive(qty);

    if (this.available < qty) {
      throw new Error('Insufficient available inventory');
    }

    this.inventory.reservedQuantity += qty;

    if (this.inventory.id) {
      this.record(
        new InventoryReservedEvent({
          inventoryId: this.inventory.id,
          quantity: qty,
        }),
      );
    }
  }

  consume(qty: number) {
    this.assertPositive(qty);

    if (this.inventory.reservedQuantity < qty) {
      throw new Error('Cannot consume more than reserved inventory');
    }

    if (this.inventory.quantity < qty) {
      throw new Error('Cannot consume more than total inventory');
    }

    this.inventory.quantity -= qty;
    this.inventory.reservedQuantity -= qty;

    if (this.inventory.id) {
      this.record(
        new InventoryConsumedEvent({
          inventoryId: this.inventory.id,
          quantity: qty,
        }),
      );
    }
  }

  release(qty: number) {
    this.assertPositive(qty);

    if (this.inventory.reservedQuantity < qty) {
      throw new Error('Cannot release more than reserved inventory');
    }

    this.inventory.reservedQuantity -= qty;

    if (this.inventory.id) {
      this.record(
        new InventoryReleasedEvent({
          inventoryId: this.inventory.id,
          quantity: qty,
        }),
      );
    }
  }

  restock(qty: number) {
    this.assertPositive(qty);

    this.inventory.quantity += qty;

    if (this.inventory.id) {
      this.record(
        new InventoryRestockedEvent({
          inventoryId: this.inventory.id,
          quantity: qty,
        }),
      );
    }
  }

  snapshot() {
    return {
      id: this.inventory.id,
      quantity: this.inventory.quantity,
      reservedQuantity: this.inventory.reservedQuantity,
    };
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
      throw new Error('Quantity must be positive');
    }
  }
}
