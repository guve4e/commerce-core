import { VariantAggregate } from './variant.aggregate';
import { VariantStatus } from './variant-status.enum';

describe('VariantAggregate', () => {
  it('disables variant', () => {
    const aggregate = new VariantAggregate({
      status: VariantStatus.ACTIVE,
    });

    aggregate.disable();

    expect(aggregate.status).toBe(VariantStatus.DISABLED);
  });

  it('does not allow ordering disabled variant', () => {
    const aggregate = new VariantAggregate({
      status: VariantStatus.DISABLED,
    });

    expect(() => aggregate.assertCanOrder()).toThrow();
  });

  it('allows ordering active variant', () => {
    const aggregate = new VariantAggregate({
      status: VariantStatus.ACTIVE,
    });

    expect(() => aggregate.assertCanOrder()).not.toThrow();
  });
});
