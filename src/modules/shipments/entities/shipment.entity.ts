export interface Shipment {
  id: string;

  orderId: string;

  carrier: string;

  trackingNumber?: string;

  status: string;

  createdAt: Date;
}
