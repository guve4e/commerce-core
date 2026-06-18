export class PaymentAggregate {
  constructor(
    private readonly payment: {
      status: string;
    },
  ) {}

  authorize() {
    if (this.payment.status !== 'pending') {
      throw new Error(`Cannot authorize payment from ${this.payment.status}`);
    }

    this.payment.status = 'authorized';
  }

  capture() {
    if (
      this.payment.status !== 'authorized' &&
      this.payment.status !== 'pending'
    ) {
      throw new Error(`Cannot capture payment from ${this.payment.status}`);
    }

    this.payment.status = 'paid';
  }

  refund() {
    if (this.payment.status !== 'paid') {
      throw new Error(`Cannot refund payment from ${this.payment.status}`);
    }

    this.payment.status = 'refunded';
  }

  fail() {
    this.payment.status = 'failed';
  }

  get status() {
    return this.payment.status;
  }
}
