export class AddressAggregate {
  constructor(
    private readonly address: {
      line1: string;
      city: string;
      country: string;
      postalCode?: string | null;
      isDefault?: boolean | null;
    },
  ) {}

  validate() {
    if (!this.address.line1?.trim()) {
      throw new Error('Address line1 is required');
    }

    if (!this.address.city?.trim()) {
      throw new Error('Address city is required');
    }

    if (!this.address.country?.trim()) {
      throw new Error('Address country is required');
    }
  }

  markDefault() {
    this.address.isDefault = true;
  }

  unmarkDefault() {
    this.address.isDefault = false;
  }

  get isDefault() {
    return Boolean(this.address.isDefault);
  }
}
