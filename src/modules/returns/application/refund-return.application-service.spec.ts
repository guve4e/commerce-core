import { ReturnAggregate } from '../domain/return.aggregate';
import { ReturnStatus } from '../domain/return-status.enum';
import { RefundReturnApplicationService } from './refund-return.application-service';

describe('RefundReturnApplicationService', () => {
  it('refunds return', async () => {
    const ticket = new ReturnAggregate({
      id: 'return_1',
      status: ReturnStatus.APPROVED,
    });

    const repository = {
      findById: jest.fn().mockResolvedValue(ticket),
      save: jest.fn(),
    };

    const service = new RefundReturnApplicationService(repository);

    const result = await service.execute({
      returnId: 'return_1',
    });

    expect(ticket.status).toBe(ReturnStatus.REFUNDED);
    expect(repository.save).toHaveBeenCalledWith(ticket);
    expect(result).toEqual({
      return: ticket,
    });
  });

  it('throws when return is missing', async () => {
    const service = new RefundReturnApplicationService({
      findById: jest.fn().mockResolvedValue(null),
      save: jest.fn(),
    });

    await expect(
      service.execute({
        returnId: 'missing',
      }),
    ).rejects.toThrow('Return not found');
  });
});
