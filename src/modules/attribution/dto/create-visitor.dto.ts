export class CreateVisitorDto {
  storeId: string;

  sessionId?: string;

  referralCode?: string;

  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}
