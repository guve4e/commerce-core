export interface ProductVariant {
  id: string;

  sku: string;

  name: string;

  price: number;

  originalPrice?: number;

  currency: string;

  attributes: Record<string, string>;
}
