import { CheckoutAggregate } from './checkout.aggregate';

describe('CheckoutAggregate domain events', () => {
  it('records checkout.created event when checkout is created', () => {
    const checkout = makeCheckout();

    const events = checkout.peekDomainEvents();

    expect(events).toHaveLength(1);
    expect(events[0].eventName).toBe('checkout.created');
    expect(events[0].aggregateId).toBe('checkout_1');
    expect(events[0].payload).toEqual({
      checkoutId: 'checkout_1',
      storeId: 'store_1',
      customerId: 'customer_1',
      grandTotal: 100,
      currency: 'BGN',
    });
  });

  it('records checkout.ready event when checkout is marked ready', () => {
    const checkout = makeCheckout();

    checkout.pullDomainEvents();
    checkout.markReady();

    const events = checkout.peekDomainEvents();

    expect(events).toHaveLength(1);
    expect(events[0].eventName).toBe('checkout.ready');
    expect(events[0].aggregateId).toBe('checkout_1');
    expect(events[0].payload).toEqual({
      checkoutId: 'checkout_1',
      storeId: 'store_1',
      customerId: 'customer_1',
    });
  });

  it('pulls and clears domain events', () => {
    const checkout = makeCheckout();

    const events = checkout.pullDomainEvents();

    expect(events).toHaveLength(1);
    expect(checkout.peekDomainEvents()).toEqual([]);
  });
});

function makeCheckout() {
  return CheckoutAggregate.create({
    id: 'checkout_1',
    storeId: 'store_1',
    customerId: 'customer_1',
    shippingAddressId: 'shipping_1',
    billingAddressId: 'billing_1',
    currency: 'BGN',
    lines: [
      {
        sku: 'SKU-1',
        name: 'Serum',
        quantity: 2,
        unitPrice: 50,
        subtotal: 100,
      },
    ],
    totals: {
      subtotal: 100,
      discountTotal: 0,
      shippingTotal: 0,
      taxTotal: 0,
      grandTotal: 100,
    },
    coupon: null,
    promotionIds: [],
  });
}
