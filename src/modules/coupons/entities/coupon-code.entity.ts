export interface CouponCode {
  id: string;

  campaignId: string;

  code: string;

  percentageOff?: number;

  fixedAmountOff?: number;

  maxUses?: number;

  expiresAt?: Date;

  active: boolean;
}
