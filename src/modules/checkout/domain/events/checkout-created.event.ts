import { randomUUID } from 'crypto';
import { DomainEvent } from '../../../shared/domain/events/domain-event';

export interface CheckoutCreatedPayload {
  checkoutId: string;
  storeId: string;
  customerId: string;
  grandTotal: number;
  currency: string;
}

export class CheckoutCreatedEvent
  implements DomainEvent<CheckoutCreatedPayload>
{
  readonly eventId = randomUUID();
  readonly eventName = 'checkout.created';
  readonly occurredAt = new Date();

  constructor(readonly payload: CheckoutCreatedPayload) {}

  get aggregateId() {
    return this.payload.checkoutId;
  }
}
