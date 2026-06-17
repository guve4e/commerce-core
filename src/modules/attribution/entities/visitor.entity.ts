export interface Visitor {
  id: string;

  hash: string;

  ipAddress?: string;

  userAgent?: string;

  createdAt: Date;
}
