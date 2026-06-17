export class CreateOrderItemDto {
  variantId?: string;
  sku: string;
  name: string;
  price: string;
  quantity: number;
}

export class CreateOrderDto {
  storeId: string;
  customerId?: string;

  email: string;
  firstName: string;
  lastName?: string;
  phone?: string;

  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;

  subtotal: string;
  shipping: string;
  tax: string;
  total: string;

  items: CreateOrderItemDto[];
}
