import { DomainEvent } from '../domain/events/domain-event';

export interface Outbox {
  store(events: DomainEvent[]): Promise<void>;
}
