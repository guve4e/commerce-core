import { PricingAggregate } from './pricing.aggregate';

describe('PricingAggregate', () => {
  it('creates an active price by default', () => {
    const price = PricingAggregate.create({
      id: 'price_1',
      storeId: 'store_1',
      variantId: 'variant_1',
      currency: 'BGN',
      amount: 50,
      compareAtAmount: 70,
    });

    expect(price.snapshot()).toEqual({
      id: 'price_1',
      storeId: 'store_1',
      variantId: 'variant_1',
      currency: 'BGN',
      amount: 50,
      compareAtAmount: 70,
      status: 'active',
    });
  });

  it('requires store id', () => {
    expect(() =>
      PricingAggregate.create({
        id: 'price_1',
        storeId: '',
        variantId: 'variant_1',
        currency: 'BGN',
        amount: 50,
      }),
    ).toThrow('Store id is required');
  });

  it('requires variant id', () => {
    expect(() =>
      PricingAggregate.create({
        id: 'price_1',
        storeId: 'store_1',
        variantId: '',
        currency: 'BGN',
        amount: 50,
      }),
    ).toThrow('Variant id is required');
  });

  it('requires currency', () => {
    expect(() =>
      PricingAggregate.create({
        id: 'price_1',
        storeId: 'store_1',
        variantId: 'variant_1',
        currency: '',
        amount: 50,
      }),
    ).toThrow('Currency is required');
  });

  it('rejects negative price amount', () => {
    expect(() =>
      PricingAggregate.create({
        id: 'price_1',
        storeId: 'store_1',
        variantId: 'variant_1',
        currency: 'BGN',
        amount: -1,
      }),
    ).toThrow('Price amount cannot be negative');
  });

  it('rejects non-finite price amount', () => {
    expect(() =>
      PricingAggregate.create({
        id: 'price_1',
        storeId: 'store_1',
        variantId: 'variant_1',
        currency: 'BGN',
        amount: Number.NaN,
      }),
    ).toThrow('Price amount must be a finite number');
  });

  it('requires compare-at amount to be greater than price amount', () => {
    expect(() =>
      PricingAggregate.create({
        id: 'price_1',
        storeId: 'store_1',
        variantId: 'variant_1',
        currency: 'BGN',
        amount: 50,
        compareAtAmount: 50,
      }),
    ).toThrow('Compare-at amount must be greater than price amount');
  });

  it('can change price amount', () => {
    const price = makePrice();

    price.changePrice(60);

    expect(price.snapshot().amount).toBe(60);
  });

  it('does not allow price to exceed compare-at amount', () => {
    const price = makePrice();

    expect(() => price.changePrice(90)).toThrow(
      'Compare-at amount must be greater than price amount',
    );
  });

  it('can set compare-at amount', () => {
    const price = PricingAggregate.create({
      id: 'price_1',
      storeId: 'store_1',
      variantId: 'variant_1',
      currency: 'BGN',
      amount: 50,
    });

    price.setCompareAtAmount(80);

    expect(price.snapshot().compareAtAmount).toBe(80);
  });

  it('can clear compare-at amount', () => {
    const price = makePrice();

    price.setCompareAtAmount(null);

    expect(price.snapshot().compareAtAmount).toBeNull();
  });

  it('can be disabled', () => {
    const price = makePrice();

    price.disable();

    expect(price.snapshot().status).toBe('disabled');
  });

  it('can be activated', () => {
    const price = makePrice();

    price.disable();
    price.activate();

    expect(price.snapshot().status).toBe('active');
  });
});

function makePrice() {
  return PricingAggregate.create({
    id: 'price_1',
    storeId: 'store_1',
    variantId: 'variant_1',
    currency: 'BGN',
    amount: 50,
    compareAtAmount: 80,
  });
}
