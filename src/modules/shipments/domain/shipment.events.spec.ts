import { ShipmentAggregate } from './shipment.aggregate';
import { ShipmentStatus } from './shipment-status.enum';

describe('ShipmentAggregate domain events', () => {
  it('records shipment.shipped event', () => {
    const aggregate = new ShipmentAggregate({
      id: 'shipment_1',
      status: ShipmentStatus.PENDING,
    });

    aggregate.ship();

    expect(aggregate.peekDomainEvents()).toEqual([
      expect.objectContaining({
        eventName: 'shipment.shipped',
        aggregateId: 'shipment_1',
        payload: {
          shipmentId: 'shipment_1',
        },
      }),
    ]);
  });

  it('records shipment.delivered event', () => {
    const aggregate = new ShipmentAggregate({
      id: 'shipment_1',
      status: ShipmentStatus.SHIPPED,
    });

    aggregate.deliver();

    expect(aggregate.peekDomainEvents()).toEqual([
      expect.objectContaining({
        eventName: 'shipment.delivered',
        aggregateId: 'shipment_1',
        payload: {
          shipmentId: 'shipment_1',
        },
      }),
    ]);
  });

  it('does not record events without shipment id', () => {
    const aggregate = new ShipmentAggregate({
      status: ShipmentStatus.PENDING,
    });

    aggregate.ship();

    expect(aggregate.peekDomainEvents()).toEqual([]);
  });
});
