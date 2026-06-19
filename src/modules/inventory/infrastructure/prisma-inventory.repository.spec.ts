import { PrismaInventoryRepository } from './prisma-inventory.repository';
import { InventoryAggregate } from '../domain/inventory.aggregate';

describe('PrismaInventoryRepository', () => {
  it('finds inventory by id', async () => {
    const prisma = makePrisma();
    const outbox = makeOutbox();
    const repository = new PrismaInventoryRepository(prisma as any, outbox);

    const aggregate = await repository.findById('inventory_1');

    expect(prisma.inventoryItem.findUnique).toHaveBeenCalledWith({
      where: { id: 'inventory_1' },
    });

    expect(aggregate).toBeInstanceOf(InventoryAggregate);
    expect(aggregate?.snapshot()).toEqual({
      id: 'inventory_1',
      quantity: 25,
      reservedQuantity: 3,
    });
  });

  it('returns null when inventory by id is missing', async () => {
    const prisma = makePrisma();
    prisma.inventoryItem.findUnique.mockResolvedValueOnce(null);

    const repository = new PrismaInventoryRepository(prisma as any, makeOutbox());

    await expect(repository.findById('missing')).resolves.toBeNull();
  });

  it('finds inventory by variant id', async () => {
    const prisma = makePrisma();
    const repository = new PrismaInventoryRepository(prisma as any, makeOutbox());

    const aggregate = await repository.findByVariantId('variant_1');

    expect(prisma.inventoryItem.findUnique).toHaveBeenCalledWith({
      where: { variantId: 'variant_1' },
    });

    expect(aggregate?.snapshot()).toEqual({
      id: 'inventory_1',
      quantity: 25,
      reservedQuantity: 3,
    });
  });

  it('saves inventory aggregate and stores domain events', async () => {
    const prisma = makePrisma();
    const outbox = makeOutbox();
    const repository = new PrismaInventoryRepository(prisma as any, outbox);

    const aggregate = new InventoryAggregate({
      id: 'inventory_1',
      quantity: 25,
      reservedQuantity: 0,
    });

    aggregate.reserve(3);

    await repository.save(aggregate);

    expect(prisma.inventoryItem.update).toHaveBeenCalledWith({
      where: { id: 'inventory_1' },
      data: {
        quantity: 25,
        reservedQuantity: 3,
      },
    });

    expect(outbox.store).toHaveBeenCalledWith([
      expect.objectContaining({
        eventName: 'inventory.reserved',
        aggregateId: 'inventory_1',
      }),
    ]);
    expect(aggregate.peekDomainEvents()).toEqual([]);
  });

});

function makeOutbox() {
  return {
    store: jest.fn(),
  };
}

function makePrisma() {
  return {
    inventoryItem: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'inventory_1',
        quantity: 25,
        reservedQuantity: 3,
      }),
      update: jest.fn(),
    },
  };
}
