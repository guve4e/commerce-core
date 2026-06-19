import { randomUUID } from 'crypto';
import { DomainEvent } from '../../../shared/domain/events/domain-event';

export interface OrderCreatedPayload {
  orderId: string;
  orderNumber: number | null;
  storeId: string;
  customerId: string | null;
  total: number;
  currency: string;
}

export class OrderCreatedEvent implements DomainEvent<OrderCreatedPayload> {
  readonly eventId = randomUUID();
  readonly eventName = 'order.created';
  readonly occurredAt = new Date();

  constructor(readonly payload: OrderCreatedPayload) {}

  get aggregateId() {
    return this.payload.orderId;
  }
}
