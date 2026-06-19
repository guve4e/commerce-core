import { randomUUID } from 'crypto';
import { DomainEvent } from '../../../shared/domain/events/domain-event';

export interface OrderDeliveredPayload {
  orderId: string;
}

export class OrderDeliveredEvent implements DomainEvent<OrderDeliveredPayload> {
  readonly eventId = randomUUID();
  readonly eventName = 'order.delivered';
  readonly occurredAt = new Date();

  constructor(readonly payload: OrderDeliveredPayload) {}

  get aggregateId() {
    return this.payload.orderId;
  }
}
