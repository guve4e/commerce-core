export class CreateProductVariantDto {
  sku: string;
  name: string;
  price: string;
  originalPrice?: string;
  currency: string;
  attributes?: Record<string, string>;
}

export class CreateProductDto {
  storeId: string;
  name: string;
  slug: string;
  description?: string;
  status?: string;
  variants: CreateProductVariantDto[];
}
