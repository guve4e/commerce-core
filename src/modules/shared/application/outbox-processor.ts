import { EventPublisher } from './event-publisher';
import { OutboxRecord } from './outbox-record';
import { DomainEvent } from '../domain/events/domain-event';

export interface OutboxRecordStore {
  findPending(limit: number): Promise<OutboxRecord[]>;
  markPublished(recordId: string, publishedAt: Date): Promise<void>;
  markFailed(recordId: string, failedAt: Date, reason: string): Promise<void>;
}

export class OutboxProcessor {
  constructor(
    private readonly outboxRecordStore: OutboxRecordStore,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async processPending(limit = 50) {
    const records = await this.outboxRecordStore.findPending(limit);

    for (const record of records) {
      try {
        await this.eventPublisher.publish(this.toDomainEvent(record));
        await this.outboxRecordStore.markPublished(record.id, new Date());
      } catch (error) {
        await this.outboxRecordStore.markFailed(
          record.id,
          new Date(),
          error instanceof Error ? error.message : 'Unknown error',
        );
      }
    }

    return {
      processed: records.length,
    };
  }

  private toDomainEvent(record: OutboxRecord): DomainEvent {
    return {
      eventId: record.eventId,
      eventName: record.eventName,
      aggregateId: record.aggregateId,
      occurredAt: record.occurredAt,
      payload: record.payload,
    };
  }
}
