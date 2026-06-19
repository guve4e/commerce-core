import { randomUUID } from 'crypto';
import { DomainEvent } from '../../../shared/domain/events/domain-event';

export interface ReturnRejectedPayload {
  returnId: string;
}

export class ReturnRejectedEvent implements DomainEvent<ReturnRejectedPayload> {
  readonly eventId = randomUUID();
  readonly eventName = 'return.rejected';
  readonly occurredAt = new Date();

  constructor(readonly payload: ReturnRejectedPayload) {}

  get aggregateId() {
    return this.payload.returnId;
  }
}
