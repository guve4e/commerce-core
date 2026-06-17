export interface Store {
  id: string;

  name: string;

  slug: string;

  domain?: string;

  currency: string;

  active: boolean;

  createdAt: Date;
}
