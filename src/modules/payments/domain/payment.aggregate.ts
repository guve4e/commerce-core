export class PaymentAggregate {
  constructor(
    private readonly payment: {
      status: string;
    },
  ) {}

  get status(): string {
    return this.payment.status;
  }

  capture() {
    if (this.payment.status === 'captured') {
      throw new Error('Payment already captured');
    }

    this.payment.status = 'captured';
  }

  fail() {
    this.payment.status = 'failed';
  }
}
