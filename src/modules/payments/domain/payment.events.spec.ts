import { PaymentAggregate } from './payment.aggregate';

describe('PaymentAggregate domain events', () => {
  it('records payment.captured when payment is captured', () => {
    const payment = new PaymentAggregate({
      id: 'payment_1',
      status: 'pending',
    });

    payment.capture();

    expect(payment.peekDomainEvents()).toEqual([
      expect.objectContaining({
        eventName: 'payment.captured',
        aggregateId: 'payment_1',
        payload: {
          paymentId: 'payment_1',
        },
      }),
    ]);
  });

  it('records payment.failed when payment fails', () => {
    const payment = new PaymentAggregate({
      id: 'payment_1',
      status: 'pending',
    });

    payment.fail();

    expect(payment.peekDomainEvents()).toEqual([
      expect.objectContaining({
        eventName: 'payment.failed',
        aggregateId: 'payment_1',
        payload: {
          paymentId: 'payment_1',
        },
      }),
    ]);
  });

  it('does not record payment event when payment id is missing', () => {
    const payment = new PaymentAggregate({
      status: 'pending',
    });

    payment.capture();

    expect(payment.peekDomainEvents()).toEqual([]);
  });
});
