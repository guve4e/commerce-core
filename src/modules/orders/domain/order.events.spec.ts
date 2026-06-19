import { OrderAggregate } from './order.aggregate';

describe('OrderAggregate domain events', () => {
  it('records order.paid when order is paid', () => {
    const order = new OrderAggregate({
      id: 'order_1',
      status: 'created',
    });

    order.pay();

    expect(order.peekDomainEvents()).toEqual([
      expect.objectContaining({
        eventName: 'order.paid',
        aggregateId: 'order_1',
        payload: {
          orderId: 'order_1',
        },
      }),
    ]);
  });

  it('records order.shipped when order is shipped', () => {
    const order = new OrderAggregate({
      id: 'order_1',
      status: 'processing',
    });

    order.ship();

    expect(order.peekDomainEvents()).toEqual([
      expect.objectContaining({
        eventName: 'order.shipped',
        aggregateId: 'order_1',
        payload: {
          orderId: 'order_1',
        },
      }),
    ]);
  });

  it('records order.delivered when order is delivered', () => {
    const order = new OrderAggregate({
      id: 'order_1',
      status: 'shipped',
    });

    order.deliver();

    expect(order.peekDomainEvents()).toEqual([
      expect.objectContaining({
        eventName: 'order.delivered',
        aggregateId: 'order_1',
        payload: {
          orderId: 'order_1',
        },
      }),
    ]);
  });

  it('records order.cancelled when order is cancelled', () => {
    const order = new OrderAggregate({
      id: 'order_1',
      status: 'created',
    });

    order.cancel();

    expect(order.peekDomainEvents()).toEqual([
      expect.objectContaining({
        eventName: 'order.cancelled',
        aggregateId: 'order_1',
        payload: {
          orderId: 'order_1',
        },
      }),
    ]);
  });

  it('does not record lifecycle events when order id is missing', () => {
    const order = new OrderAggregate({
      status: 'created',
    });

    order.pay();

    expect(order.peekDomainEvents()).toEqual([]);
  });
});
