import { randomUUID } from 'crypto';
import { DomainEvent } from '../../../shared/domain/events/domain-event';

export interface ShipmentDeliveredPayload {
  shipmentId: string;
}

export class ShipmentDeliveredEvent
  implements DomainEvent<ShipmentDeliveredPayload>
{
  readonly eventId = randomUUID();
  readonly eventName = 'shipment.delivered';
  readonly occurredAt = new Date();

  constructor(readonly payload: ShipmentDeliveredPayload) {}

  get aggregateId() {
    return this.payload.shipmentId;
  }
}
