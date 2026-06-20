export class SetDefaultPriceDto {
  id: string;
  storeId: string;
  variantId: string;
  currency: string;
  amount: number;
  compareAtAmount?: number | null;
}
