import { DomainEventRecorder } from '../../shared/domain/events/domain-event-recorder';
import { PaymentCapturedEvent } from './events/payment-captured.event';
import { PaymentFailedEvent } from './events/payment-failed.event';

export class PaymentAggregate extends DomainEventRecorder {
  constructor(
    private readonly payment: {
      id?: string;
      status: string;
    },
  ) {
    super();
  }

  snapshot() {
    return {
      id: this.payment.id,
      status: this.payment.status,
    };
  }

  get status(): string {
    return this.payment.status;
  }

  capture() {
    if (this.payment.status === 'captured') {
      throw new Error('Payment already captured');
    }

    this.payment.status = 'captured';

    if (this.payment.id) {
      this.record(new PaymentCapturedEvent({ paymentId: this.payment.id }));
    }
  }

  fail() {
    this.payment.status = 'failed';

    if (this.payment.id) {
      this.record(new PaymentFailedEvent({ paymentId: this.payment.id }));
    }
  }
}
