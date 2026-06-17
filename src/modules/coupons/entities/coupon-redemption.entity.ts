export interface CouponRedemption {
  id: string;

  couponCodeId: string;

  orderId: string;

  customerId?: string;

  redeemedAt: Date;
}
