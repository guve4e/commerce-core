import { CustomerStatus } from './customer-status.enum';

export class CustomerAggregate {
  constructor(
    private readonly customer: {
      id?: string;
      status?: string | null;
      email?: string | null;
    },
  ) {}

  activate() {
    this.customer.status = CustomerStatus.ACTIVE;
  }

  block() {
    this.customer.status = CustomerStatus.BLOCKED;
  }

  convertGuest(email: string) {
    if (!email || !email.includes('@')) {
      throw new Error('Valid email is required to convert guest customer');
    }

    if (this.customer.status !== CustomerStatus.GUEST) {
      throw new Error(`Cannot convert customer from status ${this.status}`);
    }

    this.customer.email = email;
    this.customer.status = CustomerStatus.ACTIVE;
  }

  assertCanOrder() {
    if (this.customer.status === CustomerStatus.BLOCKED) {
      throw new Error('Blocked customer cannot place orders');
    }
  }

  snapshot() {
    return {
      id: this.customer.id,
      status: this.status,
      email: this.customer.email,
    };
  }

  get status() {
    return this.customer.status ?? CustomerStatus.ACTIVE;
  }

  get email() {
    return this.customer.email;
  }
}
