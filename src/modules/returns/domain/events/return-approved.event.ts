import { randomUUID } from 'crypto';
import { DomainEvent } from '../../../shared/domain/events/domain-event';

export interface ReturnApprovedPayload {
  returnId: string;
}

export class ReturnApprovedEvent implements DomainEvent<ReturnApprovedPayload> {
  readonly eventId = randomUUID();
  readonly eventName = 'return.approved';
  readonly occurredAt = new Date();

  constructor(readonly payload: ReturnApprovedPayload) {}

  get aggregateId() {
    return this.payload.returnId;
  }
}
