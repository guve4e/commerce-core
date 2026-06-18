import { CouponAggregate } from './coupon.aggregate';
import { CouponStatus } from './coupon-status.enum';

describe('CouponAggregate', () => {
  it('allows active coupon', () => {
    const coupon = new CouponAggregate({
      active: true,
      maxUses: 10,
      usedCount: 0,
      expiresAt: null,
      status: CouponStatus.ACTIVE,
    });

    expect(coupon.canApply()).toBe(true);
  });

  it('rejects disabled coupon', () => {
    const coupon = new CouponAggregate({
      active: true,
      maxUses: 10,
      usedCount: 0,
      expiresAt: null,
      status: CouponStatus.DISABLED,
    });

    expect(() => coupon.apply()).toThrow();
  });

  it('increments usage count', () => {
    const coupon = new CouponAggregate({
      active: true,
      maxUses: 10,
      usedCount: 0,
      expiresAt: null,
      status: CouponStatus.ACTIVE,
    });

    coupon.apply();

    expect(coupon.usedCount).toBe(1);
  });

  it('rejects exhausted coupon', () => {
    const coupon = new CouponAggregate({
      active: true,
      maxUses: 1,
      usedCount: 1,
      expiresAt: null,
      status: CouponStatus.ACTIVE,
    });

    expect(() => coupon.apply()).toThrow();
  });

  it('rejects expired coupon', () => {
    const coupon = new CouponAggregate({
      active: true,
      maxUses: 10,
      usedCount: 0,
      expiresAt: new Date('2020-01-01'),
      status: CouponStatus.ACTIVE,
    });

    expect(() => coupon.apply()).toThrow();
  });

  it('can disable coupon', () => {
    const coupon = new CouponAggregate({
      active: true,
      maxUses: 10,
      usedCount: 0,
      expiresAt: null,
      status: CouponStatus.ACTIVE,
    });

    coupon.disable();

    expect(coupon.status).toBe(CouponStatus.DISABLED);
  });
});
