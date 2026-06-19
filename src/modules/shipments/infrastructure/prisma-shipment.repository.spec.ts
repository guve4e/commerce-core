import { ShipmentStatus } from '../domain/shipment-status.enum';
import { ShipmentAggregate } from '../domain/shipment.aggregate';
import { PrismaShipmentRepository } from './prisma-shipment.repository';

describe('PrismaShipmentRepository', () => {
  it('finds shipment by id', async () => {
    const prisma = makePrisma();
    const repository = new PrismaShipmentRepository(prisma as any, makeOutbox());

    const aggregate = await repository.findById('shipment_1');

    expect(prisma.shipment.findUnique).toHaveBeenCalledWith({
      where: { id: 'shipment_1' },
    });

    expect(aggregate).toBeInstanceOf(ShipmentAggregate);
    expect(aggregate?.snapshot()).toEqual({
      id: 'shipment_1',
      status: ShipmentStatus.PENDING,
    });
  });

  it('returns null when shipment is missing', async () => {
    const prisma = makePrisma();
    prisma.shipment.findUnique.mockResolvedValueOnce(null);

    const repository = new PrismaShipmentRepository(prisma as any, makeOutbox());

    await expect(repository.findById('missing')).resolves.toBeNull();
  });

  it('saves shipment aggregate and stores domain events', async () => {
    const prisma = makePrisma();
    const outbox = makeOutbox();
    const repository = new PrismaShipmentRepository(prisma as any, outbox);

    const aggregate = new ShipmentAggregate({
      id: 'shipment_1',
      status: ShipmentStatus.PENDING,
    });

    aggregate.ship();

    await repository.save(aggregate);

    expect(prisma.shipment.update).toHaveBeenCalledWith({
      where: { id: 'shipment_1' },
      data: {
        status: ShipmentStatus.SHIPPED,
      },
    });

    expect(outbox.store).toHaveBeenCalledWith([
      expect.objectContaining({
        eventName: 'shipment.shipped',
        aggregateId: 'shipment_1',
      }),
    ]);
    expect(aggregate.peekDomainEvents()).toEqual([]);
  });

  it('requires shipment id when saving', async () => {
    const repository = new PrismaShipmentRepository(
      makePrisma() as any,
      makeOutbox(),
    );

    const aggregate = new ShipmentAggregate({
      status: ShipmentStatus.PENDING,
    });

    await expect(repository.save(aggregate)).rejects.toThrow(
      'Shipment id is required to save',
    );
  });
});

function makePrisma() {
  return {
    shipment: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'shipment_1',
        status: ShipmentStatus.PENDING,
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
