import { PrismaStoreRepository } from './prisma-store.repository';
import { StoreAggregate } from '../domain/store.aggregate';

describe('PrismaStoreRepository', () => {
  it('finds store by id', async () => {
    const prisma = makePrisma();
    const repository = new PrismaStoreRepository(prisma as any);

    const aggregate = await repository.findById('store_1');

    expect(prisma.store.findUnique).toHaveBeenCalledWith({
      where: { id: 'store_1' },
      include: {
        StoreSettings: true,
      },
    });

    expect(aggregate).toBeInstanceOf(StoreAggregate);
    expect(aggregate?.snapshot()).toEqual({
      id: 'store_1',
      name: 'Main Store',
      slug: 'main-store',
      status: 'active',
      defaultLanguage: 'bg',
      supportedLanguages: ['bg'],
      currency: 'BGN',
    });
  });

  it('finds store by slug', async () => {
    const prisma = makePrisma();
    const repository = new PrismaStoreRepository(prisma as any);

    const aggregate = await repository.findBySlug('main-store');

    expect(prisma.store.findUnique).toHaveBeenCalledWith({
      where: { slug: 'main-store' },
      include: {
        StoreSettings: true,
      },
    });

    expect(aggregate?.snapshot().slug).toBe('main-store');
  });

  it('returns null when store is missing', async () => {
    const prisma = makePrisma();
    prisma.store.findUnique.mockResolvedValueOnce(null);

    const repository = new PrismaStoreRepository(prisma as any);

    await expect(repository.findById('missing')).resolves.toBeNull();
  });

  it('uses BGN when store settings are missing', async () => {
    const prisma = makePrisma();
    prisma.store.findUnique.mockResolvedValueOnce({
      id: 'store_1',
      name: 'Main Store',
      slug: 'main-store',
      StoreSettings: null,
    });

    const repository = new PrismaStoreRepository(prisma as any);

    const aggregate = await repository.findById('store_1');

    expect(aggregate?.snapshot().currency).toBe('BGN');
  });

  it('saves store aggregate and upserts settings currency', async () => {
    const prisma = makePrisma();
    const repository = new PrismaStoreRepository(prisma as any);

    const aggregate = StoreAggregate.create({
      id: 'store_1',
      name: 'Updated Store',
      slug: 'updated-store',
      defaultLanguage: 'bg',
      supportedLanguages: ['bg'],
      currency: 'EUR',
    });

    await repository.save(aggregate);

    expect(prisma.store.update).toHaveBeenCalledWith({
      where: { id: 'store_1' },
      data: {
        name: 'Updated Store',
        slug: 'updated-store',
        StoreSettings: {
          upsert: {
            create: {
              currency: 'EUR',
            },
            update: {
              currency: 'EUR',
            },
          },
        },
      },
    });
  });
});

function makePrisma() {
  return {
    store: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'store_1',
        name: 'Main Store',
        slug: 'main-store',
        StoreSettings: {
          currency: 'BGN',
        },
      }),
      update: jest.fn(),
    },
  };
}
