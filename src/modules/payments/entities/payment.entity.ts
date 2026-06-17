export interface Payment {
  id: string;

  orderId: string;

  provider: string;

  providerTransactionId?: string;

  amount: number;

  currency: string;

  status: string;

  createdAt: Date;
}
