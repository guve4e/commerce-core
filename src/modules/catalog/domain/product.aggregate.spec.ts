import { ProductAggregate } from './product.aggregate';
import { ProductStatus } from './product-status.enum';

describe('ProductAggregate', () => {
  it('publishes draft product', () => {
    const aggregate = new ProductAggregate({
      status: ProductStatus.DRAFT,
    });

    aggregate.publish();

    expect(aggregate.status).toBe(ProductStatus.ACTIVE);
  });

  it('archives active product', () => {
    const aggregate = new ProductAggregate({
      status: ProductStatus.ACTIVE,
    });

    aggregate.archive();

    expect(aggregate.status).toBe(ProductStatus.ARCHIVED);
  });

  it('does not order archived product', () => {
    const aggregate = new ProductAggregate({
      status: ProductStatus.ARCHIVED,
    });

    expect(() => aggregate.assertCanOrder()).toThrow();
  });

  it('allows ordering active product', () => {
    const aggregate = new ProductAggregate({
      status: ProductStatus.ACTIVE,
    });

    expect(() => aggregate.assertCanOrder()).not.toThrow();
  });
});
