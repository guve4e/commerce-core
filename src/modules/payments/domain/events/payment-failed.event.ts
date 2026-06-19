import { randomUUID } from 'crypto';
import { DomainEvent } from '../../../shared/domain/events/domain-event';

export interface PaymentFailedPayload {
  paymentId: string;
}

export class PaymentFailedEvent implements DomainEvent<PaymentFailedPayload> {
  readonly eventId = randomUUID();
  readonly eventName = 'payment.failed';
  readonly occurredAt = new Date();

  constructor(readonly payload: PaymentFailedPayload) {}

  get aggregateId() {
    return this.payload.paymentId;
  }
}
