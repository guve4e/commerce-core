import { CartAggregate } from './cart.aggregate';
import { CartStatus } from './cart-status.enum';

describe('CartAggregate', () => {
  it('allows active cart modification', () => {
    const aggregate = new CartAggregate({
      status: CartStatus.ACTIVE,
    });

    expect(() => aggregate.assertActive()).not.toThrow();
  });

  it('does not allow checked out cart modification', () => {
    const aggregate = new CartAggregate({
      status: CartStatus.CHECKED_OUT,
    });

    expect(() => aggregate.assertActive()).toThrow();
  });

  it('checks out active cart', () => {
    const aggregate = new CartAggregate({
      status: CartStatus.ACTIVE,
    });

    aggregate.checkout();

    expect(aggregate.status).toBe(CartStatus.CHECKED_OUT);
  });

  it('abandons active cart', () => {
    const aggregate = new CartAggregate({
      status: CartStatus.ACTIVE,
    });

    aggregate.abandon();

    expect(aggregate.status).toBe(CartStatus.ABANDONED);
  });
});
