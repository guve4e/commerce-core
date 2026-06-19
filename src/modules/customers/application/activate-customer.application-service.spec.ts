import { CustomerAggregate } from '../domain/customer.aggregate';
import { CustomerStatus } from '../domain/customer-status.enum';
import { ActivateCustomerApplicationService } from './activate-customer.application-service';

describe('ActivateCustomerApplicationService', () => {
  it('activates customer', async () => {
    const customer = new CustomerAggregate({
      id: 'customer_1',
      status: CustomerStatus.BLOCKED,
      email: 'customer@example.com',
    });

    const repository = {
      findById: jest.fn().mockResolvedValue(customer),
      findByEmail: jest.fn(),
      save: jest.fn(),
    };

    const service = new ActivateCustomerApplicationService(repository);

    const result = await service.execute({
      customerId: 'customer_1',
    });

    expect(customer.status).toBe(CustomerStatus.ACTIVE);
    expect(repository.save).toHaveBeenCalledWith(customer);
    expect(result).toEqual({ customer });
  });

  it('throws when customer is missing', async () => {
    const service = new ActivateCustomerApplicationService({
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
