import { randomUUID } from 'crypto';
import { DomainEvent } from '../../../shared/domain/events/domain-event';

export interface OrderShippedPayload {
  orderId: string;
}

export class OrderShippedEvent implements DomainEvent<OrderShippedPayload> {
  readonly eventId = randomUUID();
  readonly eventName = 'order.shipped';
  readonly occurredAt = new Date();

  constructor(readonly payload: OrderShippedPayload) {}

  get aggregateId() {
    return this.payload.orderId;
  }
}
