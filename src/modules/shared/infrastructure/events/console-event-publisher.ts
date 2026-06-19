import { EventPublisher } from '../../application/event-publisher';
import { DomainEvent } from '../../domain/events/domain-event';

export class ConsoleEventPublisher implements EventPublisher {
  async publish(event: DomainEvent): Promise<void> {
    console.log('[domain-event]', {
      eventId: event.eventId,
      eventName: event.eventName,
      aggregateId: event.aggregateId,
      occurredAt: event.occurredAt.toISOString(),
      payload: event.payload,
    });
  }
}
