export class CreatePaymentDto {
  orderId: string;

  provider: string;

  amount: string;

  currency: string;
}
