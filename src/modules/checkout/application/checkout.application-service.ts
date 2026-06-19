import { CheckoutAggregate, CheckoutLineSnapshot } from '../domain/checkout.aggregate';
import { CheckoutRepository } from '../domain/checkout.repository';
import { CheckoutCalculator } from '../domain/checkout-calculator.service';
import { Outbox } from '../../shared/application/outbox';
import { CustomerRepository } from '../../customers/domain/customer.repository';
import { StoreRepository } from '../../stores/domain/store.repository';

export interface CreateCheckoutCommand {
  id: string;
  storeId: string;
  customerId: string;
  shippingAddressId: string;
  billingAddressId: string;
  currency: string;
  lines: CheckoutLineSnapshot[];
  discountTotal?: number;
  shippingTotal?: number;
  taxTotal?: number;
  coupon?: {
    couponCodeId: string;
    couponCode: string;
    discountAmount: number;
  } | null;
  promotionIds?: string[];
}

export class CheckoutApplicationService {
  constructor(
    private readonly checkoutRepository: CheckoutRepository,
    private readonly storeRepository: StoreRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly outbox: Outbox,
    private readonly checkoutCalculator = new CheckoutCalculator(),
  ) {}

  async createCheckout(command: CreateCheckoutCommand) {
    const store = await this.storeRepository.findById(command.storeId);

    if (!store) {
      throw new Error('Store not found');
    }

    try {
      store.assertCanCheckout();
    } catch {
      throw new Error('Store is not active');
    }

    const customer = await this.customerRepository.findById(command.customerId);

    if (!customer) {
      throw new Error('Customer not found');
    }

    try {
      customer.assertCanOrder();
    } catch {
      throw new Error('Customer is not active');
    }

    const totals = this.checkoutCalculator.calculate({
      lines: command.lines,
      discountTotal: command.discountTotal,
      shippingTotal: command.shippingTotal,
      taxTotal: command.taxTotal,
    });

    const checkout = CheckoutAggregate.create({
      id: command.id,
      storeId: command.storeId,
      customerId: command.customerId,
      shippingAddressId: command.shippingAddressId,
      billingAddressId: command.billingAddressId,
      currency: command.currency,
      lines: command.lines,
      totals,
      coupon: command.coupon ?? null,
      promotionIds: command.promotionIds ?? [],
    });

    await this.checkoutRepository.save(checkout);
    await this.outbox.store(checkout.pullDomainEvents());

    return checkout;
  }

  async markCheckoutReady(checkoutId: string) {
    const checkout = await this.checkoutRepository.findById(checkoutId);

    if (!checkout) {
      throw new Error('Checkout not found');
    }

    checkout.markReady();

    await this.checkoutRepository.save(checkout);
    await this.outbox.store(checkout.pullDomainEvents());

    return checkout;
  }
}
