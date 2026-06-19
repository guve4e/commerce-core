import { PrismaOrderRepository } from './prisma-order.repository';
import { OrderAggregate } from '../domain/order.aggregate';

describe('PrismaOrderRepository', () => {
  it('finds order by id', async () => {
    const prisma = makePrisma();
    const repository = new PrismaOrderRepository(prisma as any, makeOutbox());

    const aggregate = await repository.findById('order_1');

    expect(prisma.order.findUnique).toHaveBeenCalledWith({
      where: { id: 'order_1' },
    });

    expect(aggregate).toBeInstanceOf(OrderAggregate);
    expect(aggregate?.snapshot()).toEqual({
      id: 'order_1',
      orderNumber: 1001,
      status: 'created',
    });
  });

  it('returns null when order by id is missing', async () => {
    const prisma = makePrisma();
    prisma.order.findUnique.mockResolvedValueOnce(null);

    const repository = new PrismaOrderRepository(prisma as any, makeOutbox());

    await expect(repository.findById('missing')).resolves.toBeNull();
  });

  it('finds order by order number', async () => {
    const prisma = makePrisma();
    const repository = new PrismaOrderRepository(prisma as any, makeOutbox());

    const aggregate = await repository.findByOrderNumber(1001);

    expect(prisma.order.findUnique).toHaveBeenCalledWith({
      where: { orderNumber: 1001 },
    });

    expect(aggregate?.snapshot()).toEqual({
      id: 'order_1',
      orderNumber: 1001,
      status: 'created',
    });
  });

  it('saves order aggregate and stores domain events', async () => {
    const prisma = makePrisma();
    const outbox = makeOutbox();
    const repository = new PrismaOrderRepository(prisma as any, outbox);

    const aggregate = new OrderAggregate({
      id: 'order_1',
      orderNumber: 1001,
      status: 'created',
    });

    aggregate.ship();

    await repository.save(aggregate);

    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 'order_1' },
      data: {
        status: 'shipped',
      },
    });

    expect(outbox.store).toHaveBeenCalledWith([
      expect.objectContaining({
        eventName: 'order.shipped',
        aggregateId: 'order_1',
      }),
    ]);
    expect(aggregate.peekDomainEvents()).toEqual([]);
  });

  it('requires order id when saving', async () => {
    const repository = new PrismaOrderRepository(makePrisma() as any, makeOutbox());

    const aggregate = new OrderAggregate({
      status: 'created',
    });

    await expect(repository.save(aggregate)).rejects.toThrow(
      'Order id is required to save',
    );
  });
});

function makePrisma() {
  return {
    order: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'order_1',
        orderNumber: 1001,
        status: 'created',
      }),
      update: jest.fn(),
    },
  };
}

function makeOutbox() {
  return {
    store: jest.fn(),
  };
}
