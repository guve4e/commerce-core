import { CartItem } from './cart-item.entity';

export interface Cart {
  id: string;

  storeId: string;

  customerId?: string;

  visitorId?: string;

  currency: string;

  items: CartItem[];

  createdAt: Date;

  updatedAt: Date;
}
