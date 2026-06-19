import { PrismaOutboxRecordStore } from './prisma-outbox-record-store';

describe('PrismaOutboxRecordStore', () => {
  it('finds pending records and maps them to OutboxRecord', async () => {
    const prisma = makePrisma();
    const store = new PrismaOutboxRecordStore(prisma as any);

    const records = await store.findPending(10);

    expect(prisma.outboxEvent.findMany).toHaveBeenCalledWith({
      where: {
        status: 'pending',
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: 10,
    });

    expect(records).toEqual([
      {
        id: 'event_1',
        eventId: 'event_1',
        eventName: 'checkout.created',
        aggregateId: 'checkout_1',
        payload: {
          checkoutId: 'checkout_1',
        },
        status: 'pending',
        occurredAt: new Date('2026-06-19T00:00:00.000Z'),
        createdAt: new Date('2026-06-19T00:00:01.000Z'),
        publishedAt: null,
        failedAt: null,
        failureReason: null,
      },
    ]);
  });

  it('marks record published', async () => {
    const prisma = makePrisma();
    const store = new PrismaOutboxRecordStore(prisma as any);
    const publishedAt = new Date('2026-06-19T00:01:00.000Z');

    await store.markPublished('event_1', publishedAt);

    expect(prisma.outboxEvent.update).toHaveBeenCalledWith({
      where: {
        id: 'event_1',
      },
      data: {
        status: 'published',
        publishedAt,
        failedAt: null,
        failureReason: null,
      },
    });
  });

  it('marks record failed', async () => {
    const prisma = makePrisma();
    const store = new PrismaOutboxRecordStore(prisma as any);
    const failedAt = new Date('2026-06-19T00:01:00.000Z');

    await store.markFailed('event_1', failedAt, 'Publisher failed');

    expect(prisma.outboxEvent.update).toHaveBeenCalledWith({
      where: {
        id: 'event_1',
      },
      data: {
        status: 'failed',
        failedAt,
        failureReason: 'Publisher failed',
      },
    });
  });
});

function makePrisma() {
  return {
    outboxEvent: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'event_1',
          eventId: 'event_1',
          eventName: 'checkout.created',
          aggregateId: 'checkout_1',
          payload: {
            checkoutId: 'checkout_1',
          },
          status: 'pending',
          occurredAt: new Date('2026-06-19T00:00:00.000Z'),
          createdAt: new Date('2026-06-19T00:00:01.000Z'),
          publishedAt: null,
          failedAt: null,
          failureReason: null,
        },
      ]),
      update: jest.fn(),
    },
  };
}
