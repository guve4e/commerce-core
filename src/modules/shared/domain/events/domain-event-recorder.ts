import { DomainEvent } from './domain-event';

export class DomainEventRecorder {
  private readonly events: DomainEvent[] = [];

  protected record(event: DomainEvent) {
    this.events.push(event);
  }

  pullDomainEvents(): DomainEvent[] {
    const pulled = [...this.events];
    this.events.length = 0;
    return pulled;
  }

  peekDomainEvents(): DomainEvent[] {
    return [...this.events];
  }
}
