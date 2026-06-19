import { OutboxProcessor, OutboxRecordStore } from './outbox-processor';
import { EventPublisher } from './event-publisher';
import { OutboxRecord } from './outbox-record';

describe('OutboxProcessor', () => {
  it('publishes pending records and marks them published', async () => {
    const record = makeRecord();
    const store = makeStore([record]);
    const publisher = makePublisher();

    const processor = new OutboxProcessor(store, publisher);

    const result = await processor.processPending(10);

    expect(result).toEqual({ processed: 1 });

    expect(store.findPending).toHaveBeenCalledWith(10);

    expect(publisher.publish).toHaveBeenCalledWith({
      eventId: 'event_1',
      eventName: 'checkout.created',
      aggregateId: 'checkout_1',
      occurredAt: record.occurredAt,
      payload: {
        checkoutId: 'checkout_1',
      },
    });

    expect(store.markPublished).toHaveBeenCalledWith(
      'event_1',
      expect.any(Date),
    );
    expect(store.markFailed).not.toHaveBeenCalled();
  });

  it('marks record failed when publishing throws', async () => {
    const record = makeRecord();
    const store = makeStore([record]);
    const publisher = makePublisher();

    jest.mocked(publisher.publish).mockRejectedValueOnce(
      new Error('Publisher failed'),
    );

    const processor = new OutboxProcessor(store, publisher);

    const result = await processor.processPending(10);

    expect(result).toEqual({ processed: 1 });
    expect(store.markPublished).not.toHaveBeenCalled();
    expect(store.markFailed).toHaveBeenCalledWith(
      'event_1',
      expect.any(Date),
      'Publisher failed',
    );
  });

  it('continues processing after one record fails', async () => {
    const failedRecord = makeRecord({
      id: 'event_1',
      eventId: 'event_1',
    });

    const successfulRecord = makeRecord({
      id: 'event_2',
      eventId: 'event_2',
      eventName: 'checkout.ready',
    });

    const store = makeStore([failedRecord, successfulRecord]);
    const publisher = makePublisher();

    jest
      .mocked(publisher.publish)
      .mockRejectedValueOnce(new Error('First failed'))
      .mockResolvedValueOnce(undefined);

    const processor = new OutboxProcessor(store, publisher);

    const result = await processor.processPending(10);

    expect(result).toEqual({ processed: 2 });
    expect(store.markFailed).toHaveBeenCalledWith(
      'event_1',
      expect.any(Date),
      'First failed',
    );
    expect(store.markPublished).toHaveBeenCalledWith(
      'event_2',
      expect.any(Date),
    );
  });

  it('uses default limit of 50', async () => {
    const store = makeStore([]);
    const publisher = makePublisher();

    const processor = new OutboxProcessor(store, publisher);

    await processor.processPending();

    expect(store.findPending).toHaveBeenCalledWith(50);
  });
});

function makeStore(records: OutboxRecord[]): jest.Mocked<OutboxRecordStore> {
  return {
    findPending: jest.fn().mockResolvedValue(records),
    markPublished: jest.fn(),
    markFailed: jest.fn(),
  };
}

function makePublisher(): jest.Mocked<EventPublisher> {
  return {
    publish: jest.fn(),
  };
}

function makeRecord(overrides: Partial<OutboxRecord> = {}): OutboxRecord {
  return {
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
    ...overrides,
  };
}
