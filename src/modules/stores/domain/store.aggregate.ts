export type StoreStatus = 'active' | 'disabled' | 'maintenance';

export interface StoreProps {
  id: string;
  name: string;
  slug: string;
  status: StoreStatus;
  defaultLanguage: string;
  supportedLanguages: string[];
  currency: string;
}

export class StoreAggregate {
  private constructor(private readonly props: StoreProps) {}

  static create(props: Omit<StoreProps, 'status'> & { status?: StoreStatus }) {
    if (!props.name?.trim()) {
      throw new Error('Store name is required');
    }

    if (!props.slug?.trim()) {
      throw new Error('Store slug is required');
    }

    if (!props.defaultLanguage?.trim()) {
      throw new Error('Default language is required');
    }

    if (!props.supportedLanguages?.length) {
      throw new Error('At least one supported language is required');
    }

    if (!props.supportedLanguages.includes(props.defaultLanguage)) {
      throw new Error('Default language must be supported');
    }

    if (!props.currency?.trim()) {
      throw new Error('Currency is required');
    }

    return new StoreAggregate({
      ...props,
      status: props.status ?? 'active',
    });
  }

  activate() {
    if (this.props.status === 'active') return;
    this.props.status = 'active';
  }

  disable() {
    if (this.props.status === 'disabled') return;
    this.props.status = 'disabled';
  }

  putInMaintenance() {
    if (this.props.status === 'maintenance') return;
    this.props.status = 'maintenance';
  }

  assertCanCheckout() {
    if (this.props.status === 'disabled') {
      throw new Error('Disabled store cannot accept checkout');
    }

    if (this.props.status === 'maintenance') {
      throw new Error('Store in maintenance cannot accept checkout');
    }
  }

  rename(name: string) {
    if (!name?.trim()) {
      throw new Error('Store name is required');
    }

    this.props.name = name;
  }

  addLanguage(language: string) {
    if (!language?.trim()) {
      throw new Error('Language is required');
    }

    if (!this.props.supportedLanguages.includes(language)) {
      this.props.supportedLanguages.push(language);
    }
  }

  removeLanguage(language: string) {
    if (language === this.props.defaultLanguage) {
      throw new Error('Cannot remove default language');
    }

    this.props.supportedLanguages = this.props.supportedLanguages.filter(
      (item) => item !== language,
    );
  }

  snapshot(): StoreProps {
    return {
      ...this.props,
      supportedLanguages: [...this.props.supportedLanguages],
    };
  }
}
