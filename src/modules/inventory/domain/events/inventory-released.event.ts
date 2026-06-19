import { randomUUID } from 'crypto';
import { DomainEvent } from '../../../shared/domain/events/domain-event';

export interface InventoryReleasedPayload {
  inventoryId: string;
  quantity: number;
}

export class InventoryReleasedEvent
  implements DomainEvent<InventoryReleasedPayload>
{
  readonly eventId = randomUUID();
  readonly eventName = 'inventory.released';
  readonly occurredAt = new Date();

  constructor(readonly payload: InventoryReleasedPayload) {}

  get aggregateId() {
    return this.payload.inventoryId;
  }
}
