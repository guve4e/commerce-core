export interface Campaign {
  id: string;

  storeId: string;

  name: string;

  description?: string;

  active: boolean;

  createdAt: Date;
}
