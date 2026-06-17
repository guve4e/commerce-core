export class CreateReturnItemDto {
  orderItemId?: string;

  sku: string;

  quantity: number;

  reason?: string;
}

export class CreateReturnDto {
  orderId: string;

  reason?: string;

  items: CreateReturnItemDto[];
}
