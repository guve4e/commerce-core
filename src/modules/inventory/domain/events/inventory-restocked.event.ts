import { randomUUID } from 'crypto';
import { DomainEvent } from '../../../shared/domain/events/domain-event';

export interface InventoryRestockedPayload {
  inventoryId: string;
  quantity: number;
}

export class InventoryRestockedEvent
  implements DomainEvent<InventoryRestockedPayload>
{
  readonly eventId = randomUUID();
  readonly eventName = 'inventory.restocked';
  readonly occurredAt = new Date();

  constructor(readonly payload: InventoryRestockedPayload) {}

  get aggregateId() {
    return this.payload.inventoryId;
  }
}
