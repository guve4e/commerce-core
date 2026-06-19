import { PrismaOutbox } from './prisma-outbox';
import { DomainEvent } from '../../domain/events/domain-event';

describe('PrismaOutbox', () => {
  it('stores domain events as outbox records', async () => {
    const prisma = makePrisma();
    const outbox = new PrismaOutbox(prisma as any);

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

    await outbox.store([event]);

    expect(prisma.outboxEvent.createMany).toHaveBeenCalledWith({
      data: [
        {
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
        },
      ],
      skipDuplicates: true,
    });
  });

  it('does nothing when there are no events', async () => {
    const prisma = makePrisma();
    const outbox = new PrismaOutbox(prisma as any);

    await outbox.store([]);

    expect(prisma.outboxEvent.createMany).not.toHaveBeenCalled();
  });
});

function makePrisma() {
  return {
    outboxEvent: {
      createMany: jest.fn(),
    },
  };
}
