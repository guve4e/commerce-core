export class CreatePromotionDto {
  id: string;
  storeId: string;
  name: string;
  discountType: 'percentage' | 'fixedAmount';
  discountValue: number;
  startsAt?: string | null;
  endsAt?: string | null;
  activate?: boolean;
}
