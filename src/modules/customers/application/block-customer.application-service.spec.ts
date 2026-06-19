import { CustomerAggregate } from '../domain/customer.aggregate';
import { CustomerStatus } from '../domain/customer-status.enum';
import { BlockCustomerApplicationService } from './block-customer.application-service';

describe('BlockCustomerApplicationService', () => {
  it('blocks customer', async () => {
    const customer = new CustomerAggregate({
      id: 'customer_1',
      status: CustomerStatus.ACTIVE,
      email: 'customer@example.com',
    });

    const repository = {
      findById: jest.fn().mockResolvedValue(customer),
      findByEmail: jest.fn(),
      save: jest.fn(),
    };

    const service = new BlockCustomerApplicationService(repository);

    const result = await service.execute({
      customerId: 'customer_1',
    });

    expect(customer.status).toBe(CustomerStatus.BLOCKED);
    expect(repository.save).toHaveBeenCalledWith(customer);
    expect(result).toEqual({ customer });
  });

  it('throws when customer is missing', async () => {
    const service = new BlockCustomerApplicationService({
      findById: jest.fn().mockResolvedValue(null),
      findByEmail: jest.fn(),
      save: jest.fn(),
    });

    await expect(
      service.execute({
        customerId: 'missing',
      }),
    ).rejects.toThrow('Customer not found');
  });
});
