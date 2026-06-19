import { StoreAggregate } from './store.aggregate';

describe('StoreAggregate', () => {
  it('creates an active store by default', () => {
    const store = StoreAggregate.create({
      id: 'store_1',
      name: 'Cosmetics Store',
      slug: 'cosmetics-store',
      defaultLanguage: 'bg',
      supportedLanguages: ['bg', 'en'],
      currency: 'BGN',
    });

    expect(store.snapshot()).toEqual({
      id: 'store_1',
      name: 'Cosmetics Store',
      slug: 'cosmetics-store',
      status: 'active',
      defaultLanguage: 'bg',
      supportedLanguages: ['bg', 'en'],
      currency: 'BGN',
    });
  });

  it('can be disabled', () => {
    const store = makeStore();

    store.disable();

    expect(store.snapshot().status).toBe('disabled');
  });

  it('can be placed in maintenance', () => {
    const store = makeStore();

    store.putInMaintenance();

    expect(store.snapshot().status).toBe('maintenance');
  });

  it('can be activated again', () => {
    const store = makeStore();

    store.disable();
    store.activate();

    expect(store.snapshot().status).toBe('active');
  });

  it('allows active store to accept checkout', () => {
    const store = makeStore();

    expect(() => store.assertCanCheckout()).not.toThrow();
  });

  it('does not allow disabled store to accept checkout', () => {
    const store = makeStore();

    store.disable();

    expect(() => store.assertCanCheckout()).toThrow(
      'Disabled store cannot accept checkout',
    );
  });

  it('does not allow maintenance store to accept checkout', () => {
    const store = makeStore();

    store.putInMaintenance();

    expect(() => store.assertCanCheckout()).toThrow(
      'Store in maintenance cannot accept checkout',
    );
  });

  it('requires a name', () => {
    expect(() =>
      StoreAggregate.create({
        id: 'store_1',
        name: '',
        slug: 'main',
        defaultLanguage: 'bg',
        supportedLanguages: ['bg'],
        currency: 'BGN',
      }),
    ).toThrow('Store name is required');
  });

  it('requires a slug', () => {
    expect(() =>
      StoreAggregate.create({
        id: 'store_1',
        name: 'Main Store',
        slug: '',
        defaultLanguage: 'bg',
        supportedLanguages: ['bg'],
        currency: 'BGN',
      }),
    ).toThrow('Store slug is required');
  });

  it('requires default language to be supported', () => {
    expect(() =>
      StoreAggregate.create({
        id: 'store_1',
        name: 'Main Store',
        slug: 'main',
        defaultLanguage: 'bg',
        supportedLanguages: ['en'],
        currency: 'BGN',
      }),
    ).toThrow('Default language must be supported');
  });

  it('can add a supported language', () => {
    const store = makeStore();

    store.addLanguage('en');

    expect(store.snapshot().supportedLanguages).toEqual(['bg', 'en']);
  });

  it('does not duplicate supported languages', () => {
    const store = makeStore();

    store.addLanguage('bg');

    expect(store.snapshot().supportedLanguages).toEqual(['bg']);
  });

  it('cannot remove the default language', () => {
    const store = makeStore();

    expect(() => store.removeLanguage('bg')).toThrow(
      'Cannot remove default language',
    );
  });

  it('can remove a non-default language', () => {
    const store = StoreAggregate.create({
      id: 'store_1',
      name: 'Main Store',
      slug: 'main',
      defaultLanguage: 'bg',
      supportedLanguages: ['bg', 'en'],
      currency: 'BGN',
    });

    store.removeLanguage('en');

    expect(store.snapshot().supportedLanguages).toEqual(['bg']);
  });
});

function makeStore() {
  return StoreAggregate.create({
    id: 'store_1',
    name: 'Main Store',
    slug: 'main',
    defaultLanguage: 'bg',
    supportedLanguages: ['bg'],
    currency: 'BGN',
  });
}
