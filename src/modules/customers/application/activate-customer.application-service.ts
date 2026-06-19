import { CustomerRepository } from '../domain/customer.repository';

export interface ActivateCustomerCommand {
  customerId: string;
}

export class ActivateCustomerApplicationService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async execute(command: ActivateCustomerCommand) {
    const customer = await this.customerRepository.findById(command.customerId);

    if (!customer) {
      throw new Error('Customer not found');
    }

    customer.activate();

    await this.customerRepository.save(customer);

    return {
      customer,
    };
  }
}
