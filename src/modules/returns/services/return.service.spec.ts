import { ReturnAggregate } from '../domain/return.aggregate';
import { ReturnStatus } from '../domain/return-status.enum';
import { ReturnService } from './return.service';

describe('ReturnService', () => {
  it('approves return through repository', async () => {
    const ticket = new ReturnAggregate({
      id: 'return_1',
      status: ReturnStatus.OPEN,
    });

    const prisma = makePrisma();
    const repository = makeRepository(ticket);
    const service = new ReturnService(prisma as any, repository);

    await service.approve('return_1');

    expect(repository.findById).toHaveBeenCalledWith('return_1');
    expect(repository.save).toHaveBeenCalledWith(ticket);
    expect(ticket.status).toBe(ReturnStatus.APPROVED);
    expect(prisma.return.findUnique).toHaveBeenCalledWith({
      where: { id: 'return_1' },
      include: {
        items: true,
        order: true,
      },
    });
  });

  it('rejects return through repository', async () => {
    const ticket = new ReturnAggregate({
      id: 'return_1',
      status: ReturnStatus.OPEN,
    });

    const service = new ReturnService(
      makePrisma() as any,
      makeRepository(ticket),
    );

    await service.reject('return_1');

    expect(ticket.status).toBe(ReturnStatus.REJECTED);
  });

  it('refunds return through repository', async () => {
    const ticket = new ReturnAggregate({
      id: 'return_1',
      status: ReturnStatus.APPROVED,
    });

    const service = new ReturnService(
      makePrisma() as any,
      makeRepository(ticket),
    );

    await service.refund('return_1');

    expect(ticket.status).toBe(ReturnStatus.REFUNDED);
  });

  it('throws when approving missing return', async () => {
    const service = new ReturnService(
      makePrisma() as any,
      makeRepository(null),
    );

    await expect(service.approve('missing')).rejects.toThrow('Return not found');
  });
});

function makePrisma() {
  return {
    return: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'return_1',
      }),
    },
  };
}

function makeRepository(ticket: ReturnAggregate | null) {
  return {
    findById: jest.fn().mockResolvedValue(ticket),
    save: jest.fn(),
  };
}
