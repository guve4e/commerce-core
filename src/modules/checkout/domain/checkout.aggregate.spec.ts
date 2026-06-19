import { CheckoutAggregate } from './checkout.aggregate';

describe('CheckoutAggregate', () => {
  it('creates a draft checkout by default', () => {
    const checkout = makeCheckout();

    expect(checkout.snapshot().status).toBe('draft');
  });

  it('requires store id', () => {
    expect(() =>
      makeCheckout({
        storeId: '',
      }),
    ).toThrow('Store id is required');
  });

  it('requires customer id', () => {
    expect(() =>
      makeCheckout({
        customerId: '',
      }),
    ).toThrow('Customer id is required');
  });

  it('requires shipping address id', () => {
    expect(() =>
      makeCheckout({
        shippingAddressId: '',
      }),
    ).toThrow('Shipping address id is required');
  });

  it('requires billing address id', () => {
    expect(() =>
      makeCheckout({
        billingAddressId: '',
      }),
    ).toThrow('Billing address id is required');
  });

  it('requires currency', () => {
    expect(() =>
      makeCheckout({
        currency: '',
      }),
    ).toThrow('Currency is required');
  });

  it('requires at least one line', () => {
    expect(() =>
      makeCheckout({
        lines: [],
      }),
    ).toThrow('Checkout must have at least one line');
  });

  it('requires line sku', () => {
    expect(() =>
      makeCheckout({
        lines: [
          {
            sku: '',
            name: 'Serum',
            quantity: 2,
            unitPrice: 50,
            subtotal: 100,
          },
        ],
      }),
    ).toThrow('Line sku is required');
  });

  it('requires line name', () => {
    expect(() =>
      makeCheckout({
        lines: [
          {
            sku: 'SKU-1',
            name: '',
            quantity: 2,
            unitPrice: 50,
            subtotal: 100,
          },
        ],
      }),
    ).toThrow('Line name is required');
  });

  it('requires positive integer quantity', () => {
    expect(() =>
      makeCheckout({
        lines: [
          {
            sku: 'SKU-1',
            name: 'Serum',
            quantity: 0,
            unitPrice: 50,
            subtotal: 0,
          },
        ],
      }),
    ).toThrow('Line quantity must be a positive integer');
  });

  it('requires valid line subtotal', () => {
    expect(() =>
      makeCheckout({
        lines: [
          {
            sku: 'SKU-1',
            name: 'Serum',
            quantity: 2,
            unitPrice: 50,
            subtotal: 90,
          },
        ],
      }),
    ).toThrow('Line subtotal must equal quantity times unit price');
  });

  it('requires subtotal to match line sum', () => {
    expect(() =>
      makeCheckout({
        totals: {
          subtotal: 90,
          discountTotal: 0,
          shippingTotal: 0,
          taxTotal: 0,
          grandTotal: 90,
        },
      }),
    ).toThrow('Subtotal must equal line subtotal sum');
  });

  it('requires valid grand total', () => {
    expect(() =>
      makeCheckout({
        totals: {
          subtotal: 100,
          discountTotal: 10,
          shippingTotal: 5,
          taxTotal: 0,
          grandTotal: 100,
        },
      }),
    ).toThrow('Grand total is invalid');
  });

  it('does not allow discount total to exceed subtotal', () => {
    expect(() =>
      makeCheckout({
        totals: {
          subtotal: 100,
          discountTotal: 101,
          shippingTotal: 0,
          taxTotal: 0,
          grandTotal: -1,
        },
      }),
    ).toThrow('Grand total cannot be negative');
  });

  it('validates coupon data', () => {
    expect(() =>
      makeCheckout({
        coupon: {
          couponCodeId: '',
          couponCode: 'SAVE10',
          discountAmount: 10,
        },
      }),
    ).toThrow('Coupon code id is required');
  });

  it('requires coupon discount greater than zero', () => {
    expect(() =>
      makeCheckout({
        coupon: {
          couponCodeId: 'coupon_1',
          couponCode: 'SAVE10',
          discountAmount: 0,
        },
      }),
    ).toThrow('Coupon discount amount must be greater than zero');
  });

  it('moves draft to ready', () => {
    const checkout = makeCheckout();

    checkout.markReady();

    expect(checkout.snapshot().status).toBe('ready');
  });

  it('does not allow non-draft checkout to be marked ready', () => {
    const checkout = makeCheckout();

    checkout.markReady();

    expect(() => checkout.markReady()).toThrow(
      'Only draft checkout can be marked ready',
    );
  });

  it('moves ready checkout to awaiting payment', () => {
    const checkout = makeCheckout();

    checkout.markReady();
    checkout.awaitPayment();

    expect(checkout.snapshot().status).toBe('awaitingPayment');
  });

  it('moves awaiting payment checkout to paid', () => {
    const checkout = makeCheckout();

    checkout.markReady();
    checkout.awaitPayment();
    checkout.markPaid();

    expect(checkout.snapshot().status).toBe('paid');
  });

  it('moves paid checkout to completed', () => {
    const checkout = makeCheckout();

    checkout.markReady();
    checkout.awaitPayment();
    checkout.markPaid();
    checkout.complete();

    expect(checkout.snapshot().status).toBe('completed');
  });

  it('can cancel draft checkout', () => {
    const checkout = makeCheckout();

    checkout.cancel();

    expect(checkout.snapshot().status).toBe('cancelled');
  });

  it('can cancel awaiting payment checkout', () => {
    const checkout = makeCheckout();

    checkout.markReady();
    checkout.awaitPayment();
    checkout.cancel();

    expect(checkout.snapshot().status).toBe('cancelled');
  });

  it('cannot cancel completed checkout', () => {
    const checkout = makeCheckout();

    checkout.markReady();
    checkout.awaitPayment();
    checkout.markPaid();
    checkout.complete();

    expect(() => checkout.cancel()).toThrow(
      'Completed checkout cannot be cancelled',
    );
  });

  it('returns immutable snapshots', () => {
    const checkout = makeCheckout();

    const snapshot = checkout.snapshot();
    snapshot.lines[0].name = 'Changed';
    snapshot.promotionIds.push('promo_2');

    expect(checkout.snapshot().lines[0].name).toBe('Serum');
    expect(checkout.snapshot().promotionIds).toEqual(['promo_1']);
  });
});

function makeCheckout(overrides: Partial<Parameters<typeof CheckoutAggregate.create>[0]> = {}) {
  return CheckoutAggregate.create({
    id: 'checkout_1',
    storeId: 'store_1',
    customerId: 'customer_1',
    shippingAddressId: 'address_shipping_1',
    billingAddressId: 'address_billing_1',
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
      discountTotal: 10,
      shippingTotal: 5,
      taxTotal: 0,
      grandTotal: 95,
    },
    coupon: {
      couponCodeId: 'coupon_1',
      couponCode: 'SAVE10',
      discountAmount: 10,
    },
    promotionIds: ['promo_1'],
    ...overrides,
  });
}
