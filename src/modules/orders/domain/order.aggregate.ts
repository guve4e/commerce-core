import { OrderStatus } from './order-status.enum';

export class OrderAggregate {
  constructor(
    private readonly order: {
      status: string;
    },
  ) {}

  ship() {
    if (
      this.order.status !== OrderStatus.CREATED &&
      this.order.status !== OrderStatus.PROCESSING
    ) {
      throw new Error(`Cannot ship order from status ${this.order.status}`);
    }

    this.order.status = OrderStatus.SHIPPED;
  }

  deliver() {
    if (this.order.status !== OrderStatus.SHIPPED) {
      throw new Error(`Cannot deliver order from status ${this.order.status}`);
    }

    this.order.status = OrderStatus.DELIVERED;
  }

  cancel() {
    if (this.order.status === OrderStatus.DELIVERED) {
      throw new Error(`Cannot cancel order from status ${this.order.status}`);
    }

    this.order.status = OrderStatus.CANCELLED;
  }

  get status() {
    return this.order.status;
  }
}
