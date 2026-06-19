import { createOutboxRecord } from './outbox-record';
import { DomainEvent } from '../domain/events/domain-event';

describe('createOutboxRecord', () => {
  it('creates pending outbox record from domain event', () => {
    const occurredAt = new Date('2026-06-19T00:00:00.000Z');

    const event: DomainEvent = {
      eventId: 'event_1',
      eventName: 'checkout.created',
      aggregateId: 'checkout_1',
      occurredAt,
      payload: {
        checkoutId: 'checkout_1',
      },
    };

    const record = createOutboxRecord(event);

    expect(record).toEqual({
      id: 'event_1',
      eventId: 'event_1',
      eventName: 'checkout.created',
      aggregateId: 'checkout_1',
      payload: {
        checkoutId: 'checkout_1',
      },
      status: 'pending',
      occurredAt,
      createdAt: expect.any(Date),
      publishedAt: null,
      failedAt: null,
      failureReason: null,
    });
  });
});
