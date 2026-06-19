import { randomUUID } from 'crypto';
import { DomainEvent } from '../../../shared/domain/events/domain-event';

export interface ReturnRefundedPayload {
  returnId: string;
}

export class ReturnRefundedEvent implements DomainEvent<ReturnRefundedPayload> {
  readonly eventId = randomUUID();
  readonly eventName = 'return.refunded';
  readonly occurredAt = new Date();

  constructor(readonly payload: ReturnRefundedPayload) {}

  get aggregateId() {
    return this.payload.returnId;
  }
}
