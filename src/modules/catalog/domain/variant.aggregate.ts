import { VariantStatus } from './variant-status.enum';

export class VariantAggregate {
  constructor(
    private readonly variant: {
      status: VariantStatus;
    },
  ) {}

  disable() {
    this.variant.status = VariantStatus.DISABLED;
  }

  activate() {
    this.variant.status = VariantStatus.ACTIVE;
  }

  assertCanOrder() {
    if (this.variant.status !== VariantStatus.ACTIVE) {
      throw new Error(
        `Variant cannot be ordered from status ${this.variant.status}`,
      );
    }
  }

  get status() {
    return this.variant.status;
  }
}
