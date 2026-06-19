import { randomUUID } from 'crypto';
import { DomainEvent } from '../../../shared/domain/events/domain-event';

export interface OrderCancelledPayload {
  orderId: string;
}

export class OrderCancelledEvent implements DomainEvent<OrderCancelledPayload> {
  readonly eventId = randomUUID();
  readonly eventName = 'order.cancelled';
  readonly occurredAt = new Date();

  constructor(readonly payload: OrderCancelledPayload) {}

  get aggregateId() {
    return this.payload.orderId;
  }
}
