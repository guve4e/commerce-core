export type PromotionStatus = 'draft' | 'active' | 'disabled' | 'expired';
export type PromotionDiscountType = 'percentage' | 'fixedAmount';

export interface PromotionProps {
  id: string;
  storeId: string;
  name: string;
  status: PromotionStatus;
  discountType: PromotionDiscountType;
  discountValue: number;
  startsAt?: Date | null;
  endsAt?: Date | null;
}

export class PromotionAggregate {
  private constructor(private readonly props: PromotionProps) {}

  static create(
    props: Omit<PromotionProps, 'status'> & { status?: PromotionStatus },
  ) {
    if (!props.storeId?.trim()) {
      throw new Error('Store id is required');
    }

    if (!props.name?.trim()) {
      throw new Error('Promotion name is required');
    }

    validateDiscount(props.discountType, props.discountValue);
    validateDateRange(props.startsAt ?? null, props.endsAt ?? null);

    return new PromotionAggregate({
      ...props,
      startsAt: props.startsAt ?? null,
      endsAt: props.endsAt ?? null,
      status: props.status ?? 'draft',
    });
  }

  activate(now = new Date()) {
    if (this.props.endsAt && this.props.endsAt <= now) {
      throw new Error('Expired promotion cannot be activated');
    }

    this.props.status = 'active';
  }

  disable() {
    this.props.status = 'disabled';
  }

  markExpired() {
    this.props.status = 'expired';
  }

  rename(name: string) {
    if (!name?.trim()) {
      throw new Error('Promotion name is required');
    }

    this.props.name = name;
  }

  changeDiscount(type: PromotionDiscountType, value: number) {
    validateDiscount(type, value);

    this.props.discountType = type;
    this.props.discountValue = value;
  }

  changeSchedule(startsAt: Date | null, endsAt: Date | null) {
    validateDateRange(startsAt, endsAt);

    this.props.startsAt = startsAt;
    this.props.endsAt = endsAt;
  }

  isCurrentlyActive(now = new Date()) {
    if (this.props.status !== 'active') {
      return false;
    }

    if (this.props.startsAt && this.props.startsAt > now) {
      return false;
    }

    if (this.props.endsAt && this.props.endsAt <= now) {
      return false;
    }

    return true;
  }

  snapshot(): PromotionProps {
    return { ...this.props };
  }
}

function validateDiscount(type: PromotionDiscountType, value: number) {
  if (!Number.isFinite(value)) {
    throw new Error('Discount value must be a finite number');
  }

  if (value <= 0) {
    throw new Error('Discount value must be greater than zero');
  }

  if (type === 'percentage' && value > 100) {
    throw new Error('Percentage discount cannot exceed 100');
  }
}

function validateDateRange(startsAt: Date | null, endsAt: Date | null) {
  if (startsAt && endsAt && endsAt <= startsAt) {
    throw new Error('Promotion end date must be after start date');
  }
}
