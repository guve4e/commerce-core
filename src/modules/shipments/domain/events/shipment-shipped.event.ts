import { randomUUID } from 'crypto';
import { DomainEvent } from '../../../shared/domain/events/domain-event';

export interface ShipmentShippedPayload {
  shipmentId: string;
}

export class ShipmentShippedEvent
  implements DomainEvent<ShipmentShippedPayload>
{
  readonly eventId = randomUUID();
  readonly eventName = 'shipment.shipped';
  readonly occurredAt = new Date();

  constructor(readonly payload: ShipmentShippedPayload) {}

  get aggregateId() {
    return this.payload.shipmentId;
  }
}
