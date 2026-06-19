import { ReturnStatus } from '../domain/return-status.enum';
import { ReturnAggregate } from '../domain/return.aggregate';
import { PrismaReturnRepository } from './prisma-return.repository';

describe('PrismaReturnRepository', () => {
  it('finds return by id', async () => {
    const prisma = makePrisma();
    const repository = new PrismaReturnRepository(prisma as any, makeOutbox());

    const aggregate = await repository.findById('return_1');

    expect(prisma.return.findUnique).toHaveBeenCalledWith({
      where: { id: 'return_1' },
    });

    expect(aggregate).toBeInstanceOf(ReturnAggregate);
    expect(aggregate?.snapshot()).toEqual({
      id: 'return_1',
      status: ReturnStatus.OPEN,
    });
  });

  it('returns null when return is missing', async () => {
    const prisma = makePrisma();
    prisma.return.findUnique.mockResolvedValueOnce(null);

    const repository = new PrismaReturnRepository(prisma as any, makeOutbox());

    await expect(repository.findById('missing')).resolves.toBeNull();
  });

  it('saves return aggregate and stores domain events', async () => {
    const prisma = makePrisma();
    const outbox = makeOutbox();
    const repository = new PrismaReturnRepository(prisma as any, outbox);

    const aggregate = new ReturnAggregate({
      id: 'return_1',
      status: ReturnStatus.OPEN,
    });

    aggregate.approve();

    await repository.save(aggregate);

    expect(prisma.return.update).toHaveBeenCalledWith({
      where: { id: 'return_1' },
      data: {
        status: ReturnStatus.APPROVED,
      },
    });

    expect(outbox.store).toHaveBeenCalledWith([
      expect.objectContaining({
        eventName: 'return.approved',
        aggregateId: 'return_1',
      }),
    ]);
    expect(aggregate.peekDomainEvents()).toEqual([]);
  });

  it('requires return id when saving', async () => {
    const repository = new PrismaReturnRepository(
      makePrisma() as any,
      makeOutbox(),
    );

    const aggregate = new ReturnAggregate({
      status: ReturnStatus.OPEN,
    });

    await expect(repository.save(aggregate)).rejects.toThrow(
      'Return id is required to save',
    );
  });
});

function makePrisma() {
  return {
    return: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'return_1',
        status: ReturnStatus.OPEN,
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
