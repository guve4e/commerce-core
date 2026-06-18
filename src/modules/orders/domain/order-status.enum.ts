export enum OrderStatus {
  CREATED = 'created',
  PROCESSING = 'processing',

  SHIPPED = 'shipped',
  DELIVERED = 'delivered',

  RETURN_CREATED = 'return_created',
  RETURN_APPROVED = 'return_approved',
  RETURN_DECLINED = 'return_declined',

  CANCELLED = 'cancelled',
}
