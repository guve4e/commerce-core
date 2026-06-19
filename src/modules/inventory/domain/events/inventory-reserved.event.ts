import { randomUUID } from 'crypto';
import { DomainEvent } from '../../../shared/domain/events/domain-event';

export interface InventoryReservedPayload {
  inventoryId: string;
  quantity: number;
}

export class InventoryReservedEvent
  implements DomainEvent<InventoryReservedPayload>
{
  readonly eventId = randomUUID();
  readonly eventName = 'inventory.reserved';
  readonly occurredAt = new Date();

  constructor(readonly payload: InventoryReservedPayload) {}

  get aggregateId() {
    return this.payload.inventoryId;
  }
}
