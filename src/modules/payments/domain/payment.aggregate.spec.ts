import { PaymentAggregate } from './payment.aggregate';

describe('PaymentAggregate', () => {

  it('should capture payment', () => {
    const aggregate = new PaymentAggregate({
      status: 'pending',
    });

    aggregate.capture();

    expect(aggregate.status).toBe('captured');
  });

  it('should fail payment', () => {
    const aggregate = new PaymentAggregate({
      status: 'pending',
    });

    aggregate.fail();

    expect(aggregate.status).toBe('failed');
  });

  it('should not capture already captured payment', () => {
    const aggregate = new PaymentAggregate({
      status: 'captured',
    });

    expect(() => aggregate.capture()).toThrow();
  });

});
