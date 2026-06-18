import { OrderAggregate } from './order.aggregate';

describe('OrderAggregate', () => {

  it('should transition created -> processing when paid', () => {
    const aggregate = new OrderAggregate({
      status: 'created',
    });

    aggregate.pay();

    expect(aggregate.status).toBe('processing');
  });

  it('should transition processing -> shipped', () => {
    const aggregate = new OrderAggregate({
      status: 'processing',
    });

    aggregate.ship();

    expect(aggregate.status).toBe('shipped');
  });

  it('should transition shipped -> delivered', () => {
    const aggregate = new OrderAggregate({
      status: 'shipped',
    });

    aggregate.deliver();

    expect(aggregate.status).toBe('delivered');
  });

  it('should cancel created order', () => {
    const aggregate = new OrderAggregate({
      status: 'created',
    });

    aggregate.cancel();

    expect(aggregate.status).toBe('cancelled');
  });

  it('should not cancel delivered order', () => {
    const aggregate = new OrderAggregate({
      status: 'delivered',
    });

    expect(() => aggregate.cancel()).toThrow();
  });

});
