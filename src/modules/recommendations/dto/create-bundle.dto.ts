export class CreateBundleDto {
  storeId: string;
  slug: string;
  name: string;
  description?: string;
  active?: boolean;
}

export class AddBundleItemDto {
  variantId: string;
  quantity?: number;
  sortOrder?: number;
}
