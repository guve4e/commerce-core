export class CheckoutDto {
  customerId: string;

  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;

  shipping?: string;
  tax?: string;
}
