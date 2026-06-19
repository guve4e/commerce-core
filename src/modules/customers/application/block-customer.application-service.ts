import { CustomerRepository } from '../domain/customer.repository';

export interface BlockCustomerCommand {
  customerId: string;
}

export class BlockCustomerApplicationService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async execute(command: BlockCustomerCommand) {
    const customer = await this.customerRepository.findById(command.customerId);

    if (!customer) {
      throw new Error('Customer not found');
    }

    customer.block();

    await this.customerRepository.save(customer);

    return {
      customer,
    };
  }
}
