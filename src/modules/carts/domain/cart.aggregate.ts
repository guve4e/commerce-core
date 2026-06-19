import { CartStatus } from './cart-status.enum';

export class CartAggregate {
  constructor(
    private readonly cart: {
      status: string;
    },
  ) {}

  assertActive() {
    if (this.cart.status !== CartStatus.ACTIVE) {
      throw new Error(`Cannot modify cart with status ${this.cart.status}`);
    }
  }

  checkout() {
    this.assertActive();
    this.cart.status = CartStatus.CHECKED_OUT;
  }

  abandon() {
    this.assertActive();
    this.cart.status = CartStatus.ABANDONED;
  }

  get status() {
    return this.cart.status;
  }
}
