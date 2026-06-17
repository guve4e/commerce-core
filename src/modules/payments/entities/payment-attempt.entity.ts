export interface PaymentAttempt {
  id: string;

  provider: string;

  status: string;

  providerReference?: string;

  createdAt: Date;
}
