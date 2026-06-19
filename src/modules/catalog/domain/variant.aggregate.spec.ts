import { VariantAggregate } from './variant.aggregate';
import { VariantStatus } from './variant-status.enum';

describe('VariantAggregate', () => {
  it('changes price', () => {
    const aggregate = new VariantAggregate({
      status: VariantStatus.ACTIVE,
      price: 20,
    });

    aggregate.changePrice(30);

    expect(aggregate.price).toBe(30);
  });

  it('does not allow negative prices', () => {
    const aggregate = new VariantAggregate({
      status: VariantStatus.ACTIVE,
      price: 20,
    });

    expect(() => aggregate.changePrice(-1)).toThrow();
  });

  it('disables variant', () => {
    const aggregate = new VariantAggregate({
      status: VariantStatus.ACTIVE,
      price: 20,
    });

    aggregate.disable();

    expect(aggregate.status).toBe(VariantStatus.DISABLED);
  });

  it('does not allow ordering disabled variant', () => {
    const aggregate = new VariantAggregate({
      status: VariantStatus.DISABLED,
      price: 20,
    });

    expect(() => aggregate.assertCanOrder()).toThrow();
  });

  it('allows ordering active variant', () => {
    const aggregate = new VariantAggregate({
      status: VariantStatus.ACTIVE,
      price: 20,
    });

    expect(() => aggregate.assertCanOrder()).not.toThrow();
  });
});
