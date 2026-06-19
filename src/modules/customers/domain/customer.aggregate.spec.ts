import { CustomerAggregate } from './customer.aggregate';
import { CustomerStatus } from './customer-status.enum';

describe('CustomerAggregate', () => {
  it('activates customer', () => {
    const customer = { status: CustomerStatus.GUEST };

    const aggregate = new CustomerAggregate(customer);

    aggregate.activate();

    expect(aggregate.status).toBe(CustomerStatus.ACTIVE);
  });

  it('blocks customer', () => {
    const customer = { status: CustomerStatus.ACTIVE };

    const aggregate = new CustomerAggregate(customer);

    aggregate.block();

    expect(aggregate.status).toBe(CustomerStatus.BLOCKED);
  });

  it('does not allow blocked customer to order', () => {
    const aggregate = new CustomerAggregate({
      status: CustomerStatus.BLOCKED,
    });

    expect(() => aggregate.assertCanOrder()).toThrow();
  });

  it('allows active customer to order', () => {
    const aggregate = new CustomerAggregate({
      status: CustomerStatus.ACTIVE,
    });

    expect(() => aggregate.assertCanOrder()).not.toThrow();
  });

  it('converts guest customer to active customer', () => {
    const customer = {
      status: CustomerStatus.GUEST,
      email: null,
    };

    const aggregate = new CustomerAggregate(customer);

    aggregate.convertGuest('customer@example.com');

    expect(aggregate.status).toBe(CustomerStatus.ACTIVE);
    expect(aggregate.email).toBe('customer@example.com');
  });

  it('does not convert guest without valid email', () => {
    const aggregate = new CustomerAggregate({
      status: CustomerStatus.GUEST,
      email: null,
    });

    expect(() => aggregate.convertGuest('bad-email')).toThrow();
  });
});
