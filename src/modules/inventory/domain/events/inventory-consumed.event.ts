import { randomUUID } from 'crypto';
import { DomainEvent } from '../../../shared/domain/events/domain-event';

export interface InventoryConsumedPayload {
  inventoryId: string;
  quantity: number;
}

export class InventoryConsumedEvent
  implements DomainEvent<InventoryConsumedPayload>
{
  readonly eventId = randomUUID();
  readonly eventName = 'inventory.consumed';
  readonly occurredAt = new Date();

  constructor(readonly payload: InventoryConsumedPayload) {}

  get aggregateId() {
    return this.payload.inventoryId;
  }
}
