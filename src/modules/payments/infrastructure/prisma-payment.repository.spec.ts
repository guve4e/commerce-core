import { PaymentAggregate } from '../domain/payment.aggregate';
import { PrismaPaymentRepository } from './prisma-payment.repository';

describe('PrismaPaymentRepository', () => {
  it('finds payment by id', async () => {
    const prisma = makePrisma();
    const repository = new PrismaPaymentRepository(prisma as any, makeOutbox());

    const aggregate = await repository.findById('payment_1');

    expect(prisma.payment.findUnique).toHaveBeenCalledWith({
      where: { id: 'payment_1' },
    });

    expect(aggregate).toBeInstanceOf(PaymentAggregate);
    expect(aggregate?.snapshot()).toEqual({
      id: 'payment_1',
      status: 'pending',
    });
  });

  it('returns null when payment is missing', async () => {
    const prisma = makePrisma();
    prisma.payment.findUnique.mockResolvedValueOnce(null);

    const repository = new PrismaPaymentRepository(prisma as any, makeOutbox());

    await expect(repository.findById('missing')).resolves.toBeNull();
  });

  it('saves payment aggregate and stores domain events', async () => {
    const prisma = makePrisma();
    const outbox = makeOutbox();
    const repository = new PrismaPaymentRepository(prisma as any, outbox);

    const aggregate = new PaymentAggregate({
      id: 'payment_1',
      status: 'pending',
    });

    aggregate.capture();

    await repository.save(aggregate);

    expect(prisma.payment.update).toHaveBeenCalledWith({
      where: { id: 'payment_1' },
      data: {
        status: 'captured',
      },
    });

    expect(outbox.store).toHaveBeenCalledWith([
      expect.objectContaining({
        eventName: 'payment.captured',
        aggregateId: 'payment_1',
      }),
    ]);
    expect(aggregate.peekDomainEvents()).toEqual([]);
  });

  it('requires payment id when saving', async () => {
    const repository = new PrismaPaymentRepository(
      makePrisma() as any,
      makeOutbox(),
    );

    const aggregate = new PaymentAggregate({
      status: 'pending',
    });

    await expect(repository.save(aggregate)).rejects.toThrow(
      'Payment id is required to save',
    );
  });
});

function makePrisma() {
  return {
    payment: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'payment_1',
        status: 'pending',
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
