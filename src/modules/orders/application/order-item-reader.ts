export interface OrderItemForFulfillment {
  id: string;
  variantId: string | null;
  quantity: number;
}

export interface OrderItemReader {
  findItemsForFulfillment(orderId: string): Promise<OrderItemForFulfillment[]>;
}
