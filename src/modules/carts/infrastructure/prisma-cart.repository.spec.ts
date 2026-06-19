import { CartAggregate } from '../domain/cart.aggregate';
import { CartStatus } from '../domain/cart-status.enum';
import { PrismaCartRepository } from './prisma-cart.repository';

describe('PrismaCartRepository', () => {
  it('finds cart by id', async () => {
    const prisma = makePrisma();
    const repository = new PrismaCartRepository(prisma as any);

    const aggregate = await repository.findById('cart_1');

    expect(prisma.cart.findUnique).toHaveBeenCalledWith({
      where: { id: 'cart_1' },
    });

    expect(aggregate).toBeInstanceOf(CartAggregate);
    expect(aggregate?.snapshot()).toEqual({
      id: 'cart_1',
      customerId: 'customer_1',
      status: CartStatus.ACTIVE,
    });
  });

  it('finds active cart by customer id', async () => {
    const prisma = makePrisma();
    const repository = new PrismaCartRepository(prisma as any);

    const aggregate = await repository.findActiveByCustomerId('customer_1');

    expect(prisma.cart.findFirst).toHaveBeenCalledWith({
      where: {
        customerId: 'customer_1',
        status: CartStatus.ACTIVE,
      },
    });

    expect(aggregate?.snapshot()).toEqual({
      id: 'cart_1',
      customerId: 'customer_1',
      status: CartStatus.ACTIVE,
    });
  });

  it('returns null when cart is missing', async () => {
    const prisma = makePrisma();
    prisma.cart.findUnique.mockResolvedValueOnce(null);

    const repository = new PrismaCartRepository(prisma as any);

    await expect(repository.findById('missing')).resolves.toBeNull();
  });

  it('saves cart aggregate', async () => {
    const prisma = makePrisma();
    const repository = new PrismaCartRepository(prisma as any);

    const aggregate = new CartAggregate({
      id: 'cart_1',
      customerId: 'customer_1',
      status: CartStatus.ACTIVE,
    });

    aggregate.checkout();

    await repository.save(aggregate);

    expect(prisma.cart.update).toHaveBeenCalledWith({
      where: { id: 'cart_1' },
      data: {
        status: CartStatus.CHECKED_OUT,
      },
    });
  });

  it('requires cart id when saving', async () => {
    const repository = new PrismaCartRepository(makePrisma() as any);

    const aggregate = new CartAggregate({
      status: CartStatus.ACTIVE,
    });

    await expect(repository.save(aggregate)).rejects.toThrow(
      'Cart id is required to save',
    );
  });
});

function makePrisma() {
  return {
    cart: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'cart_1',
        customerId: 'customer_1',
        status: CartStatus.ACTIVE,
      }),
      findFirst: jest.fn().mockResolvedValue({
        id: 'cart_1',
        customerId: 'customer_1',
        status: CartStatus.ACTIVE,
      }),
      update: jest.fn(),
    },
  };
}
