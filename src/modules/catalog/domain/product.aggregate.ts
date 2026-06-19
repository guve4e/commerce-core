import { ProductStatus } from './product-status.enum';

export class ProductAggregate {
  constructor(
    private readonly product: {
      status: ProductStatus;
    },
  ) {}

  publish() {
    if (this.product.status !== ProductStatus.DRAFT) {
      throw new Error(
        `Cannot publish product from status ${this.product.status}`,
      );
    }

    this.product.status = ProductStatus.ACTIVE;
  }

  archive() {
    if (this.product.status === ProductStatus.ARCHIVED) {
      throw new Error('Product already archived');
    }

    this.product.status = ProductStatus.ARCHIVED;
  }

  assertCanOrder() {
    if (this.product.status !== ProductStatus.ACTIVE) {
      throw new Error(
        `Cannot order product with status ${this.product.status}`,
      );
    }
  }

  get status() {
    return this.product.status;
  }
}
