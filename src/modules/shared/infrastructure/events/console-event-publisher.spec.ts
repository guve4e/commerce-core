import { ConsoleEventPublisher } from './console-event-publisher';
import { DomainEvent } from '../../domain/events/domain-event';

describe('ConsoleEventPublisher', () => {
  it('logs domain event', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation();

    const publisher = new ConsoleEventPublisher();

    const event: DomainEvent = {
      eventId: 'event_1',
      eventName: 'checkout.created',
      aggregateId: 'checkout_1',
      occurredAt: new Date('2026-06-19T00:00:00.000Z'),
      payload: {
        checkoutId: 'checkout_1',
      },
    };

    await publisher.publish(event);

    expect(spy).toHaveBeenCalledWith('[domain-event]', {
      eventId: 'event_1',
      eventName: 'checkout.created',
      aggregateId: 'checkout_1',
      occurredAt: '2026-06-19T00:00:00.000Z',
      payload: {
        checkoutId: 'checkout_1',
      },
    });

    spy.mockRestore();
  });
});
