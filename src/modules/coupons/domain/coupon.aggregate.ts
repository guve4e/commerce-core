import { CouponStatus } from './coupon-status.enum';

export class CouponAggregate {
  constructor(
    private readonly coupon: {
      active: boolean;
      maxUses?: number | null;
      usedCount: number;
      expiresAt?: Date | null;
      status: CouponStatus;
    },
  ) {}

  canApply() {
    if (!this.coupon.active) {
      return false;
    }

    if (this.coupon.status !== CouponStatus.ACTIVE) {
      return false;
    }

    if (
      this.coupon.maxUses &&
      this.coupon.usedCount >= this.coupon.maxUses
    ) {
      return false;
    }

    if (
      this.coupon.expiresAt &&
      this.coupon.expiresAt < new Date()
    ) {
      return false;
    }

    return true;
  }

  apply() {
    if (!this.canApply()) {
      throw new Error('Coupon cannot be applied');
    }

    this.coupon.usedCount++;
  }

  disable() {
    this.coupon.status = CouponStatus.DISABLED;
  }

  get usedCount() {
    return this.coupon.usedCount;
  }

  get status() {
    return this.coupon.status;
  }
}
