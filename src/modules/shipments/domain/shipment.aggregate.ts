import { DomainEventRecorder } from '../../shared/domain/events/domain-event-recorder';
import { ShipmentDeliveredEvent } from './events/shipment-delivered.event';
import { ShipmentShippedEvent } from './events/shipment-shipped.event';
import { ShipmentStatus } from './shipment-status.enum';

export class ShipmentAggregate extends DomainEventRecorder {
  constructor(
    private readonly shipment: {
      id?: string;
      status: string;
    },
  ) {
    super();
  }

  ship() {
    if (this.shipment.status !== ShipmentStatus.PENDING) {
      throw new Error(
        `Cannot ship shipment from status ${this.shipment.status}`,
      );
    }

    this.shipment.status = ShipmentStatus.SHIPPED;

    if (this.shipment.id) {
      this.record(
        new ShipmentShippedEvent({
          shipmentId: this.shipment.id,
        }),
      );
    }
  }

  deliver() {
    if (this.shipment.status !== ShipmentStatus.SHIPPED) {
      throw new Error(
        `Cannot deliver shipment from status ${this.shipment.status}`,
      );
    }

    this.shipment.status = ShipmentStatus.DELIVERED;

    if (this.shipment.id) {
      this.record(
        new ShipmentDeliveredEvent({
          shipmentId: this.shipment.id,
        }),
      );
    }
  }

  snapshot() {
    return {
      id: this.shipment.id,
      status: this.shipment.status,
    };
  }

  get status() {
    return this.shipment.status;
  }
}
