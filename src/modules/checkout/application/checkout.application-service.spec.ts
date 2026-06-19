import { CheckoutApplicationService } from './checkout.application-service';
import { CheckoutRepository } from '../domain/checkout.repository';
import { StoreRepository } from '../../stores/domain/store.repository';
import { CustomerRepository } from '../../customers/domain/customer.repository';
import { StoreAggregate } from '../../stores/domain/store.aggregate';
import { CustomerAggregate } from '../../customers/domain/customer.aggregate';
import { CustomerStatus } from '../../customers/domain/customer-status.enum';
import { CheckoutAggregate } from '../domain/checkout.aggregate';
import { Outbox } from '../../shared/application/outbox';

describe('CheckoutApplicationService', () => {
  it('creates and saves checkout', async () => {
    const checkoutRepository = makeCheckoutRepository();
    const outbox = makeOutbox();
    const service = makeService({ checkoutRepository, outbox });

    const checkout = await service.createCheckout(makeCommand());

    expect(checkout.snapshot().status).toBe('draft');
    expect(checkout.snapshot().totals).toEqual({
      subtotal: 100,
      discountTotal: 10,
      shippingTotal: 5,
      taxTotal: 0,
      grandTotal: 95,
    });
    expect(checkoutRepository.save).toHaveBeenCalledWith(checkout);
    expect(outbox.store).toHaveBeenCalledTimes(1);
    expect(outbox.store).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          eventName: 'checkout.created',
          aggregateId: 'checkout_1',
        }),
      ]),
    );
  });

  it('rejects missing store', async () => {
    const service = makeService({
      storeRepository: {
        findById: jest.fn().mockResolvedValue(null),
        findBySlug: jest.fn(),
        save: jest.fn(),
      },
    });

    await expect(service.createCheckout(makeCommand())).rejects.toThrow(
      'Store not found',
    );
  });

  it('rejects inactive store', async () => {
    const store = makeStore();
    store.disable();

    const service = makeService({
      storeRepository: {
        findById: jest.fn().mockResolvedValue(store),
        findBySlug: jest.fn(),
        save: jest.fn(),
      },
    });

    await expect(service.createCheckout(makeCommand())).rejects.toThrow(
      'Store is not active',
    );
  });

  it('rejects missing customer', async () => {
    const service = makeService({
      customerRepository: {
        findById: jest.fn().mockResolvedValue(null),
        findByEmail: jest.fn(),
        save: jest.fn(),
      },
    });

    await expect(service.createCheckout(makeCommand())).rejects.toThrow(
      'Customer not found',
    );
  });

  it('rejects inactive customer', async () => {
    const customer = makeCustomer();
    customer.block();

    const service = makeService({
      customerRepository: {
        findById: jest.fn().mockResolvedValue(customer),
        findByEmail: jest.fn(),
        save: jest.fn(),
      },
    });

    await expect(service.createCheckout(makeCommand())).rejects.toThrow(
      'Customer is not active',
    );
  });

  it('marks checkout ready and saves it', async () => {
    const checkout = makeCheckout();
    checkout.pullDomainEvents();

    const checkoutRepository = makeCheckoutRepository(checkout);
    const outbox = makeOutbox();
    const service = makeService({ checkoutRepository, outbox });

    const result = await service.markCheckoutReady('checkout_1');

    expect(result.snapshot().status).toBe('ready');
    expect(checkoutRepository.save).toHaveBeenCalledWith(checkout);
    expect(outbox.store).toHaveBeenCalledTimes(1);
    expect(outbox.store).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          eventName: 'checkout.ready',
          aggregateId: 'checkout_1',
        }),
      ]),
    );
  });

  it('rejects missing checkout when marking ready', async () => {
    const checkoutRepository = makeCheckoutRepository(null);
    const service = makeService({ checkoutRepository });

    await expect(service.markCheckoutReady('checkout_missing')).rejects.toThrow(
      'Checkout not found',
    );
  });
});

function makeService(overrides: {
  checkoutRepository?: CheckoutRepository;
  storeRepository?: StoreRepository;
  customerRepository?: CustomerRepository;
  outbox?: Outbox;
} = {}) {
  return new CheckoutApplicationService(
    overrides.checkoutRepository ?? makeCheckoutRepository(),
    overrides.storeRepository ?? makeStoreRepository(),
    overrides.customerRepository ?? makeCustomerRepository(),
    overrides.outbox ?? makeOutbox(),
  );
}

function makeOutbox(): Outbox {
  return {
    store: jest.fn(),
  };
}

function makeCheckoutRepository(
  checkout: CheckoutAggregate | null = makeCheckout(),
): CheckoutRepository {
  return {
    findById: jest.fn().mockResolvedValue(checkout),
    save: jest.fn(),
  };
}

function makeStoreRepository(): StoreRepository {
  return {
    findById: jest.fn().mockResolvedValue(makeStore()),
    findBySlug: jest.fn(),
    save: jest.fn(),
  };
}

function makeCustomerRepository(): CustomerRepository {
  return {
    findById: jest.fn().mockResolvedValue(makeCustomer()),
    findByEmail: jest.fn(),
    save: jest.fn(),
  };
}

function makeStore() {
  return StoreAggregate.create({
    id: 'store_1',
    name: 'Main Store',
    slug: 'main-store',
    defaultLanguage: 'bg',
    supportedLanguages: ['bg'],
    currency: 'BGN',
  });
}

function makeCustomer() {
  return new CustomerAggregate({
    status: CustomerStatus.ACTIVE,
    email: 'customer@example.com',
  });
}

function makeCheckout() {
  return CheckoutAggregate.create({
    id: 'checkout_1',
    storeId: 'store_1',
    customerId: 'customer_1',
    shippingAddressId: 'shipping_1',
    billingAddressId: 'billing_1',
    currency: 'BGN',
    lines: [
      {
        sku: 'SKU-1',
        name: 'Serum',
        quantity: 2,
        unitPrice: 50,
        subtotal: 100,
      },
    ],
    totals: {
      subtotal: 100,
      discountTotal: 10,
      shippingTotal: 5,
      taxTotal: 0,
      grandTotal: 95,
    },
    coupon: null,
    promotionIds: [],
  });
}

function makeCommand() {
  return {
    id: 'checkout_1',
    storeId: 'store_1',
    customerId: 'customer_1',
    shippingAddressId: 'shipping_1',
    billingAddressId: 'billing_1',
    currency: 'BGN',
    lines: [
      {
        sku: 'SKU-1',
        name: 'Serum',
        quantity: 2,
        unitPrice: 50,
        subtotal: 100,
      },
    ],
    discountTotal: 10,
    shippingTotal: 5,
    taxTotal: 0,
  };
}
