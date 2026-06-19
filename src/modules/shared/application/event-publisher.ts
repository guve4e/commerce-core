import { DomainEvent } from '../domain/events/domain-event';

export interface EventPublisher {
  publish(event: DomainEvent): Promise<void>;
}
