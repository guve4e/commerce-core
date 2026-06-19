import { CheckoutCalculator } from './checkout-calculator.service';

describe('CheckoutCalculator', () => {
  it('calculates checkout totals', () => {
    const calculator = new CheckoutCalculator();

    const totals = calculator.calculate({
      lines: [
        {
          sku: 'SKU-1',
          name: 'Serum',
          quantity: 2,
          unitPrice: 50,
          subtotal: 100,
        },
        {
          sku: 'SKU-2',
          name: 'Cream',
          quantity: 1,
          unitPrice: 30,
          subtotal: 30,
        },
      ],
      discountTotal: 10,
      shippingTotal: 5,
      taxTotal: 2,
    });

    expect(totals).toEqual({
      subtotal: 130,
      discountTotal: 10,
      shippingTotal: 5,
      taxTotal: 2,
      grandTotal: 127,
    });
  });

  it('defaults optional totals to zero', () => {
    const calculator = new CheckoutCalculator();

    const totals = calculator.calculate({
      lines: [
        {
          sku: 'SKU-1',
          name: 'Serum',
          quantity: 2,
          unitPrice: 50,
          subtotal: 100,
        },
      ],
    });

    expect(totals).toEqual({
      subtotal: 100,
      discountTotal: 0,
      shippingTotal: 0,
      taxTotal: 0,
      grandTotal: 100,
    });
  });
});
