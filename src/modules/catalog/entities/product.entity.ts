import { ProductVariant } from './product-variant.entity';

export interface Product {
  id: string;

  storeId: string;

  name: string;

  slug: string;

  description?: string;

  status: 'draft' | 'active' | 'archived';

  variants: ProductVariant[];
}
