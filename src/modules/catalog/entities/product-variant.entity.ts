export interface ProductVariant {
  id: string;

  sku: string;

  name: string;

  attributes: Record<string, string>;
}
