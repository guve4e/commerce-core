import { ShipmentAggregate } from './shipment.aggregate';
import { ShipmentStatus } from './shipment-status.enum';

describe('ShipmentAggregate', () => {
  it('ships pending shipment', () => {
    const shipment = { status: ShipmentStatus.PENDING };

    const aggregate = new ShipmentAggregate(shipment);

    aggregate.ship();

    expect(aggregate.status).toBe(ShipmentStatus.SHIPPED);
  });

  it('delivers shipped shipment', () => {
    const shipment = { status: ShipmentStatus.SHIPPED };

    const aggregate = new ShipmentAggregate(shipment);

    aggregate.deliver();

    expect(aggregate.status).toBe(ShipmentStatus.DELIVERED);
  });

  it('does not deliver pending shipment', () => {
    const shipment = { status: ShipmentStatus.PENDING };

    const aggregate = new ShipmentAggregate(shipment);

    expect(() => aggregate.deliver()).toThrow();
  });

  it('does not ship delivered shipment', () => {
    const shipment = { status: ShipmentStatus.DELIVERED };

    const aggregate = new ShipmentAggregate(shipment);

    expect(() => aggregate.ship()).toThrow();
  });
});
