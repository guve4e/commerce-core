import { randomUUID } from 'crypto';
import { DomainEvent } from '../../../shared/domain/events/domain-event';

export interface OrderPaidPayload {
  orderId: string;
}

export class OrderPaidEvent implements DomainEvent<OrderPaidPayload> {
  readonly eventId = randomUUID();
  readonly eventName = 'order.paid';
  readonly occurredAt = new Date();

  constructor(readonly payload: OrderPaidPayload) {}

  get aggregateId() {
    return this.payload.orderId;
  }
}
