import { ReturnAggregate } from '../domain/return.aggregate';
import { ReturnStatus } from '../domain/return-status.enum';
import { RejectReturnApplicationService } from './reject-return.application-service';

describe('RejectReturnApplicationService', () => {
  it('rejects return', async () => {
    const ticket = new ReturnAggregate({
      id: 'return_1',
      status: ReturnStatus.OPEN,
    });

    const repository = {
      findById: jest.fn().mockResolvedValue(ticket),
      save: jest.fn(),
    };

    const service = new RejectReturnApplicationService(repository);

    const result = await service.execute({
      returnId: 'return_1',
    });

    expect(ticket.status).toBe(ReturnStatus.REJECTED);
    expect(repository.save).toHaveBeenCalledWith(ticket);
    expect(result).toEqual({
      return: ticket,
    });
  });

  it('throws when return is missing', async () => {
    const service = new RejectReturnApplicationService({
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
