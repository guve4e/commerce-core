import { AddressAggregate } from './address.aggregate';

describe('AddressAggregate', () => {
  it('validates complete address', () => {
    const aggregate = new AddressAggregate({
      line1: 'Test Street 1',
      city: 'Vidin',
      country: 'BG',
      postalCode: '3700',
    });

    expect(() => aggregate.validate()).not.toThrow();
  });

  it('requires line1', () => {
    const aggregate = new AddressAggregate({
      line1: '',
      city: 'Vidin',
      country: 'BG',
    });

    expect(() => aggregate.validate()).toThrow();
  });

  it('requires city', () => {
    const aggregate = new AddressAggregate({
      line1: 'Test Street 1',
      city: '',
      country: 'BG',
    });

    expect(() => aggregate.validate()).toThrow();
  });

  it('requires country', () => {
    const aggregate = new AddressAggregate({
      line1: 'Test Street 1',
      city: 'Vidin',
      country: '',
    });

    expect(() => aggregate.validate()).toThrow();
  });

  it('marks address as default', () => {
    const aggregate = new AddressAggregate({
      line1: 'Test Street 1',
      city: 'Vidin',
      country: 'BG',
      isDefault: false,
    });

    aggregate.markDefault();

    expect(aggregate.isDefault).toBe(true);
  });

  it('unmarks address as default', () => {
    const aggregate = new AddressAggregate({
      line1: 'Test Street 1',
      city: 'Vidin',
      country: 'BG',
      isDefault: true,
    });

    aggregate.unmarkDefault();

    expect(aggregate.isDefault).toBe(false);
  });
});
