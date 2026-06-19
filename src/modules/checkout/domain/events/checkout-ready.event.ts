import { randomUUID } from 'crypto';
import { DomainEvent } from '../../../shared/domain/events/domain-event';

export interface CheckoutReadyPayload {
  checkoutId: string;
  storeId: string;
  customerId: string;
}

export class CheckoutReadyEvent implements DomainEvent<CheckoutReadyPayload> {
  readonly eventId = randomUUID();
  readonly eventName = 'checkout.ready';
  readonly occurredAt = new Date();

  constructor(readonly payload: CheckoutReadyPayload) {}

  get aggregateId() {
    return this.payload.checkoutId;
  }
}
