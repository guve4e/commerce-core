import { randomUUID } from 'crypto';
import { DomainEvent } from '../../../shared/domain/events/domain-event';

export interface PaymentCapturedPayload {
  paymentId: string;
}

export class PaymentCapturedEvent
  implements DomainEvent<PaymentCapturedPayload>
{
  readonly eventId = randomUUID();
  readonly eventName = 'payment.captured';
  readonly occurredAt = new Date();

  constructor(readonly payload: PaymentCapturedPayload) {}

  get aggregateId() {
    return this.payload.paymentId;
  }
}
