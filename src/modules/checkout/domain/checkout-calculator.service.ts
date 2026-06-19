import { CheckoutLineSnapshot, CheckoutTotals } from './checkout.aggregate';

export interface CalculateCheckoutTotalsInput {
  lines: CheckoutLineSnapshot[];
  discountTotal?: number;
  shippingTotal?: number;
  taxTotal?: number;
}

export class CheckoutCalculator {
  calculate(input: CalculateCheckoutTotalsInput): CheckoutTotals {
    const subtotal = input.lines.reduce((sum, line) => sum + line.subtotal, 0);
    const discountTotal = input.discountTotal ?? 0;
    const shippingTotal = input.shippingTotal ?? 0;
    const taxTotal = input.taxTotal ?? 0;

    return {
      subtotal,
      discountTotal,
      shippingTotal,
      taxTotal,
      grandTotal: subtotal - discountTotal + shippingTotal + taxTotal,
    };
  }
}
