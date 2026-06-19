import { DomainEvent } from '../domain/events/domain-event';

export type OutboxRecordStatus = 'pending' | 'published' | 'failed';

export interface OutboxRecord {
  id: string;
  eventId: string;
  eventName: string;
  aggregateId: string;
  payload: unknown;
  status: OutboxRecordStatus;
  occurredAt: Date;
  createdAt: Date;
  publishedAt?: Date | null;
  failedAt?: Date | null;
  failureReason?: string | null;
}

export function createOutboxRecord(event: DomainEvent): OutboxRecord {
  return {
    id: event.eventId,
    eventId: event.eventId,
    eventName: event.eventName,
    aggregateId: event.aggregateId,
    payload: event.payload,
    status: 'pending',
    occurredAt: event.occurredAt,
    createdAt: new Date(),
    publishedAt: null,
    failedAt: null,
    failureReason: null,
  };
}
