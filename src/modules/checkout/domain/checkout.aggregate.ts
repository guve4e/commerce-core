import { DomainEventRecorder } from '../../shared/domain/events/domain-event-recorder';
import { CheckoutCreatedEvent } from './events/checkout-created.event';
import { CheckoutReadyEvent } from './events/checkout-ready.event';

export type CheckoutStatus =
  | 'draft'
  | 'ready'
  | 'awaitingPayment'
  | 'paid'
  | 'completed'
  | 'cancelled';

export interface CheckoutLineSnapshot {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CheckoutTotals {
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  taxTotal: number;
  grandTotal: number;
}

export interface CheckoutAppliedCoupon {
  couponCodeId: string;
  couponCode: string;
  discountAmount: number;
}

export interface CheckoutProps {
  id: string;
  storeId: string;
  customerId: string;
  shippingAddressId: string;
  billingAddressId: string;
  currency: string;
  status: CheckoutStatus;
  lines: CheckoutLineSnapshot[];
  totals: CheckoutTotals;
  coupon?: CheckoutAppliedCoupon | null;
  promotionIds: string[];
}

export class CheckoutAggregate extends DomainEventRecorder {
  private constructor(private readonly props: CheckoutProps) {
    super();
  }

  static create(props: Omit<CheckoutProps, 'status'> & { status?: CheckoutStatus }) {
    validateRequired(props.id, 'Checkout id is required');
    validateRequired(props.storeId, 'Store id is required');
    validateRequired(props.customerId, 'Customer id is required');
    validateRequired(props.shippingAddressId, 'Shipping address id is required');
    validateRequired(props.billingAddressId, 'Billing address id is required');
    validateRequired(props.currency, 'Currency is required');

    validateLines(props.lines);
    validateTotals(props.lines, props.totals);

    if (props.coupon) {
      validateCoupon(props.coupon);
    }

    const checkout = new CheckoutAggregate({
      ...props,
      status: props.status ?? 'draft',
      coupon: props.coupon ?? null,
      promotionIds: [...props.promotionIds],
      lines: props.lines.map((line) => ({ ...line })),
      totals: { ...props.totals },
    });

    checkout.record(
      new CheckoutCreatedEvent({
        checkoutId: checkout.props.id,
        storeId: checkout.props.storeId,
        customerId: checkout.props.customerId,
        grandTotal: checkout.props.totals.grandTotal,
        currency: checkout.props.currency,
      }),
    );

    return checkout;
  }

  markReady() {
    if (this.props.status !== 'draft') {
      throw new Error('Only draft checkout can be marked ready');
    }

    this.props.status = 'ready';

    this.record(
      new CheckoutReadyEvent({
        checkoutId: this.props.id,
        storeId: this.props.storeId,
        customerId: this.props.customerId,
      }),
    );
  }

  awaitPayment() {
    if (this.props.status !== 'ready') {
      throw new Error('Only ready checkout can await payment');
    }

    this.props.status = 'awaitingPayment';
  }

  markPaid() {
    if (this.props.status !== 'awaitingPayment') {
      throw new Error('Only checkout awaiting payment can be marked paid');
    }

    this.props.status = 'paid';
  }

  complete() {
    if (this.props.status !== 'paid') {
      throw new Error('Only paid checkout can be completed');
    }

    this.props.status = 'completed';
  }

  cancel() {
    if (this.props.status === 'completed') {
      throw new Error('Completed checkout cannot be cancelled');
    }

    if (this.props.status === 'cancelled') {
      return;
    }

    this.props.status = 'cancelled';
  }

  snapshot(): CheckoutProps {
    return {
      ...this.props,
      lines: this.props.lines.map((line) => ({ ...line })),
      totals: { ...this.props.totals },
      coupon: this.props.coupon ? { ...this.props.coupon } : null,
      promotionIds: [...this.props.promotionIds],
    };
  }
}

function validateRequired(value: string, message: string) {
  if (!value?.trim()) {
    throw new Error(message);
  }
}

function validateLines(lines: CheckoutLineSnapshot[]) {
  if (!lines.length) {
    throw new Error('Checkout must have at least one line');
  }

  for (const line of lines) {
    validateRequired(line.sku, 'Line sku is required');
    validateRequired(line.name, 'Line name is required');

    if (!Number.isInteger(line.quantity) || line.quantity <= 0) {
      throw new Error('Line quantity must be a positive integer');
    }

    validateMoney(line.unitPrice, 'Line unit price');

    const expectedSubtotal = line.quantity * line.unitPrice;

    if (line.subtotal !== expectedSubtotal) {
      throw new Error('Line subtotal must equal quantity times unit price');
    }
  }
}

function validateTotals(lines: CheckoutLineSnapshot[], totals: CheckoutTotals) {
  const expectedSubtotal = lines.reduce((sum, line) => sum + line.subtotal, 0);

  validateMoney(totals.subtotal, 'Subtotal');
  validateMoney(totals.discountTotal, 'Discount total');
  validateMoney(totals.shippingTotal, 'Shipping total');
  validateMoney(totals.taxTotal, 'Tax total');
  validateMoney(totals.grandTotal, 'Grand total');

  if (totals.subtotal !== expectedSubtotal) {
    throw new Error('Subtotal must equal line subtotal sum');
  }

  const expectedGrandTotal =
    totals.subtotal - totals.discountTotal + totals.shippingTotal + totals.taxTotal;

  if (totals.grandTotal !== expectedGrandTotal) {
    throw new Error('Grand total is invalid');
  }

  if (totals.discountTotal > totals.subtotal) {
    throw new Error('Discount total cannot exceed subtotal');
  }
}

function validateCoupon(coupon: CheckoutAppliedCoupon) {
  validateRequired(coupon.couponCodeId, 'Coupon code id is required');
  validateRequired(coupon.couponCode, 'Coupon code is required');
  validateMoney(coupon.discountAmount, 'Coupon discount amount');

  if (coupon.discountAmount <= 0) {
    throw new Error('Coupon discount amount must be greater than zero');
  }
}

function validateMoney(value: number, label: string) {
  if (!Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number`);
  }

  if (value < 0) {
    throw new Error(`${label} cannot be negative`);
  }
}
