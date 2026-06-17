import { OrderItem } from './order-item.entity';

export interface Order {
  id: string;

  orderNumber: string;

  storeId: string;

  customerId?: string;

  visitorId?: string;

  status: string;

  items: OrderItem[];

  createdAt: Date;

  updatedAt: Date;
}
