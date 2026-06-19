import { PromotionAggregate } from './promotion.aggregate';

describe('PromotionAggregate', () => {
  it('creates a draft promotion by default', () => {
    const promotion = PromotionAggregate.create({
      id: 'promo_1',
      storeId: 'store_1',
      name: 'Summer Sale',
      discountType: 'percentage',
      discountValue: 20,
    });

    expect(promotion.snapshot()).toEqual({
      id: 'promo_1',
      storeId: 'store_1',
      name: 'Summer Sale',
      status: 'draft',
      discountType: 'percentage',
      discountValue: 20,
      startsAt: null,
      endsAt: null,
    });
  });

  it('requires store id', () => {
    expect(() =>
      PromotionAggregate.create({
        id: 'promo_1',
        storeId: '',
        name: 'Summer Sale',
        discountType: 'percentage',
        discountValue: 20,
      }),
    ).toThrow('Store id is required');
  });

  it('requires name', () => {
    expect(() =>
      PromotionAggregate.create({
        id: 'promo_1',
        storeId: 'store_1',
        name: '',
        discountType: 'percentage',
        discountValue: 20,
      }),
    ).toThrow('Promotion name is required');
  });

  it('rejects non-finite discount value', () => {
    expect(() =>
      PromotionAggregate.create({
        id: 'promo_1',
        storeId: 'store_1',
        name: 'Summer Sale',
        discountType: 'percentage',
        discountValue: Number.NaN,
      }),
    ).toThrow('Discount value must be a finite number');
  });

  it('rejects zero discount value', () => {
    expect(() =>
      PromotionAggregate.create({
        id: 'promo_1',
        storeId: 'store_1',
        name: 'Summer Sale',
        discountType: 'fixedAmount',
        discountValue: 0,
      }),
    ).toThrow('Discount value must be greater than zero');
  });

  it('rejects percentage discount above 100', () => {
    expect(() =>
      PromotionAggregate.create({
        id: 'promo_1',
        storeId: 'store_1',
        name: 'Summer Sale',
        discountType: 'percentage',
        discountValue: 101,
      }),
    ).toThrow('Percentage discount cannot exceed 100');
  });

  it('rejects invalid date range', () => {
    expect(() =>
      PromotionAggregate.create({
        id: 'promo_1',
        storeId: 'store_1',
        name: 'Summer Sale',
        discountType: 'percentage',
        discountValue: 20,
        startsAt: new Date('2026-07-10T00:00:00.000Z'),
        endsAt: new Date('2026-07-01T00:00:00.000Z'),
      }),
    ).toThrow('Promotion end date must be after start date');
  });

  it('can be activated', () => {
    const promotion = makePromotion();

    promotion.activate(new Date('2026-06-01T00:00:00.000Z'));

    expect(promotion.snapshot().status).toBe('active');
  });

  it('cannot activate an expired promotion', () => {
    const promotion = PromotionAggregate.create({
      id: 'promo_1',
      storeId: 'store_1',
      name: 'Summer Sale',
      discountType: 'percentage',
      discountValue: 20,
      endsAt: new Date('2026-06-01T00:00:00.000Z'),
    });

    expect(() =>
      promotion.activate(new Date('2026-06-02T00:00:00.000Z')),
    ).toThrow('Expired promotion cannot be activated');
  });

  it('can be disabled', () => {
    const promotion = makePromotion();

    promotion.disable();

    expect(promotion.snapshot().status).toBe('disabled');
  });

  it('can be marked expired', () => {
    const promotion = makePromotion();

    promotion.markExpired();

    expect(promotion.snapshot().status).toBe('expired');
  });

  it('can rename promotion', () => {
    const promotion = makePromotion();

    promotion.rename('Winter Sale');

    expect(promotion.snapshot().name).toBe('Winter Sale');
  });

  it('can change discount', () => {
    const promotion = makePromotion();

    promotion.changeDiscount('fixedAmount', 10);

    expect(promotion.snapshot().discountType).toBe('fixedAmount');
    expect(promotion.snapshot().discountValue).toBe(10);
  });

  it('can change schedule', () => {
    const promotion = makePromotion();

    promotion.changeSchedule(
      new Date('2026-07-01T00:00:00.000Z'),
      new Date('2026-07-10T00:00:00.000Z'),
    );

    expect(promotion.snapshot().startsAt).toEqual(
      new Date('2026-07-01T00:00:00.000Z'),
    );
    expect(promotion.snapshot().endsAt).toEqual(
      new Date('2026-07-10T00:00:00.000Z'),
    );
  });

  it('returns false when not active', () => {
    const promotion = makePromotion();

    expect(promotion.isCurrentlyActive()).toBe(false);
  });

  it('returns false before start date', () => {
    const promotion = PromotionAggregate.create({
      id: 'promo_1',
      storeId: 'store_1',
      name: 'Summer Sale',
      discountType: 'percentage',
      discountValue: 20,
      startsAt: new Date('2026-07-01T00:00:00.000Z'),
      endsAt: new Date('2026-07-10T00:00:00.000Z'),
    });

    promotion.activate(new Date('2026-06-01T00:00:00.000Z'));

    expect(
      promotion.isCurrentlyActive(new Date('2026-06-30T00:00:00.000Z')),
    ).toBe(false);
  });

  it('returns false after end date', () => {
    const promotion = PromotionAggregate.create({
      id: 'promo_1',
      storeId: 'store_1',
      name: 'Summer Sale',
      discountType: 'percentage',
      discountValue: 20,
      startsAt: new Date('2026-07-01T00:00:00.000Z'),
      endsAt: new Date('2026-07-10T00:00:00.000Z'),
    });

    promotion.activate(new Date('2026-06-01T00:00:00.000Z'));

    expect(
      promotion.isCurrentlyActive(new Date('2026-07-10T00:00:00.000Z')),
    ).toBe(false);
  });

  it('returns true when active within schedule', () => {
    const promotion = PromotionAggregate.create({
      id: 'promo_1',
      storeId: 'store_1',
      name: 'Summer Sale',
      discountType: 'percentage',
      discountValue: 20,
      startsAt: new Date('2026-07-01T00:00:00.000Z'),
      endsAt: new Date('2026-07-10T00:00:00.000Z'),
    });

    promotion.activate(new Date('2026-06-01T00:00:00.000Z'));

    expect(
      promotion.isCurrentlyActive(new Date('2026-07-05T00:00:00.000Z')),
    ).toBe(true);
  });
});

function makePromotion() {
  return PromotionAggregate.create({
    id: 'promo_1',
    storeId: 'store_1',
    name: 'Summer Sale',
    discountType: 'percentage',
    discountValue: 20,
  });
}
