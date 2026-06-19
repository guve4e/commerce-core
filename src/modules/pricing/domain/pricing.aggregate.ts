export type PriceStatus = 'active' | 'disabled';

export interface PricingProps {
  id: string;
  storeId: string;
  variantId: string;
  currency: string;
  amount: number;
  compareAtAmount?: number | null;
  status: PriceStatus;
}

export class PricingAggregate {
  private constructor(private readonly props: PricingProps) {}

  static create(props: Omit<PricingProps, 'status'> & { status?: PriceStatus }) {
    if (!props.storeId?.trim()) {
      throw new Error('Store id is required');
    }

    if (!props.variantId?.trim()) {
      throw new Error('Variant id is required');
    }

    if (!props.currency?.trim()) {
      throw new Error('Currency is required');
    }

    validateAmount(props.amount, 'Price amount');

    if (props.compareAtAmount !== undefined && props.compareAtAmount !== null) {
      validateAmount(props.compareAtAmount, 'Compare-at amount');

      if (props.compareAtAmount <= props.amount) {
        throw new Error('Compare-at amount must be greater than price amount');
      }
    }

    return new PricingAggregate({
      ...props,
      status: props.status ?? 'active',
    });
  }

  changePrice(amount: number) {
    validateAmount(amount, 'Price amount');

    if (
      this.props.compareAtAmount !== undefined &&
      this.props.compareAtAmount !== null &&
      this.props.compareAtAmount <= amount
    ) {
      throw new Error('Compare-at amount must be greater than price amount');
    }

    this.props.amount = amount;
  }

  setCompareAtAmount(compareAtAmount: number | null) {
    if (compareAtAmount === null) {
      this.props.compareAtAmount = null;
      return;
    }

    validateAmount(compareAtAmount, 'Compare-at amount');

    if (compareAtAmount <= this.props.amount) {
      throw new Error('Compare-at amount must be greater than price amount');
    }

    this.props.compareAtAmount = compareAtAmount;
  }

  activate() {
    this.props.status = 'active';
  }

  disable() {
    this.props.status = 'disabled';
  }

  snapshot(): PricingProps {
    return { ...this.props };
  }
}

function validateAmount(amount: number, label: string) {
  if (!Number.isFinite(amount)) {
    throw new Error(`${label} must be a finite number`);
  }

  if (amount < 0) {
    throw new Error(`${label} cannot be negative`);
  }
}
