import { ReturnItem } from './return-item.entity';

export interface Return {
  id: string;

  orderId: string;

  status: string;

  items: ReturnItem[];

  createdAt: Date;

  updatedAt: Date;
}
