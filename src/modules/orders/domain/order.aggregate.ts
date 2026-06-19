import { DomainEventRecorder } from '../../shared/domain/events/domain-event-recorder';
import { OrderStatus } from './order-status.enum';
import { OrderCancelledEvent } from './events/order-cancelled.event';
import { OrderDeliveredEvent } from './events/order-delivered.event';
import { OrderPaidEvent } from './events/order-paid.event';
import { OrderShippedEvent } from './events/order-shipped.event';

export class OrderAggregate extends DomainEventRecorder {
  constructor(
    private readonly order: {
      id?: string;
      orderNumber?: number | null;
      status: string;
    },
  ) {
    super();
  }

  pay() {
    if (this.order.status !== OrderStatus.CREATED) {
      throw new Error(`Cannot pay order from status ${this.order.status}`);
    }

    this.order.status = OrderStatus.PROCESSING;

    if (this.order.id) {
      this.record(new OrderPaidEvent({ orderId: this.order.id }));
    }
  }

  ship() {
    if (
      this.order.status !== OrderStatus.CREATED &&
      this.order.status !== OrderStatus.PROCESSING
    ) {
      throw new Error(`Cannot ship order from status ${this.order.status}`);
    }

    this.order.status = OrderStatus.SHIPPED;

    if (this.order.id) {
      this.record(new OrderShippedEvent({ orderId: this.order.id }));
    }
  }

  deliver() {
    if (this.order.status !== OrderStatus.SHIPPED) {
      throw new Error(`Cannot deliver order from status ${this.order.status}`);
    }

    this.order.status = OrderStatus.DELIVERED;

    if (this.order.id) {
      this.record(new OrderDeliveredEvent({ orderId: this.order.id }));
    }
  }

  cancel() {
    if (this.order.status === OrderStatus.DELIVERED) {
      throw new Error(`Cannot cancel order from status ${this.order.status}`);
    }

    this.order.status = OrderStatus.CANCELLED;

    if (this.order.id) {
      this.record(new OrderCancelledEvent({ orderId: this.order.id }));
    }
  }

  snapshot() {
    return {
      id: this.order.id,
      orderNumber: this.order.orderNumber,
      status: this.order.status,
    };
  }

  get status() {
    return this.order.status;
  }
}
