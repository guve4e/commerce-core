export class CreateCouponCodeDto {
  campaignId: string;
  code: string;
  percentageOff?: string;
  fixedAmountOff?: string;
  maxUses?: number;
  expiresAt?: string;
}
