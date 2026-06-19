import { CustomerStatus } from '../domain/customer-status.enum';
import { CustomerAggregate } from '../domain/customer.aggregate';
import { PrismaCustomerRepository } from './prisma-customer.repository';

describe('PrismaCustomerRepository', () => {
  it('finds customer by id', async () => {
    const prisma = makePrisma();
    const repository = new PrismaCustomerRepository(prisma as any);

    const aggregate = await repository.findById('customer_1');

    expect(prisma.customer.findUnique).toHaveBeenCalledWith({
      where: { id: 'customer_1' },
    });

    expect(aggregate).toBeInstanceOf(CustomerAggregate);
    expect(aggregate?.snapshot()).toEqual({
      id: 'customer_1',
      status: CustomerStatus.ACTIVE,
      email: 'customer@example.com',
    });
  });

  it('finds customer by email', async () => {
    const prisma = makePrisma();
    const repository = new PrismaCustomerRepository(prisma as any);

    const aggregate = await repository.findByEmail('customer@example.com');

    expect(prisma.customer.findFirst).toHaveBeenCalledWith({
      where: { email: 'customer@example.com' },
    });

    expect(aggregate?.snapshot()).toEqual({
      id: 'customer_1',
      status: CustomerStatus.ACTIVE,
      email: 'customer@example.com',
    });
  });

  it('returns null when customer is missing', async () => {
    const prisma = makePrisma();
    prisma.customer.findUnique.mockResolvedValueOnce(null);

    const repository = new PrismaCustomerRepository(prisma as any);

    await expect(repository.findById('missing')).resolves.toBeNull();
  });

  it('saves customer aggregate', async () => {
    const prisma = makePrisma();
    const repository = new PrismaCustomerRepository(prisma as any);

    const aggregate = new CustomerAggregate({
      id: 'customer_1',
      status: CustomerStatus.ACTIVE,
      email: 'customer@example.com',
    });

    aggregate.block();

    await repository.save(aggregate);

    expect(prisma.customer.update).toHaveBeenCalledWith({
      where: { id: 'customer_1' },
      data: {
        status: CustomerStatus.BLOCKED,
        email: 'customer@example.com',
      },
    });
  });

  it('requires customer id when saving', async () => {
    const repository = new PrismaCustomerRepository(makePrisma() as any);

    const aggregate = new CustomerAggregate({
      status: CustomerStatus.ACTIVE,
      email: 'customer@example.com',
    });

    await expect(repository.save(aggregate)).rejects.toThrow(
      'Customer id is required to save',
    );
  });
});

function makePrisma() {
  return {
    customer: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'customer_1',
        status: CustomerStatus.ACTIVE,
        email: 'customer@example.com',
      }),
      findFirst: jest.fn().mockResolvedValue({
        id: 'customer_1',
        status: CustomerStatus.ACTIVE,
        email: 'customer@example.com',
      }),
      update: jest.fn(),
    },
  };
}
