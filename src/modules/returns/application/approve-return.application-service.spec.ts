import { ReturnAggregate } from '../domain/return.aggregate';
import { ReturnStatus } from '../domain/return-status.enum';
import { ApproveReturnApplicationService } from './approve-return.application-service';

describe('ApproveReturnApplicationService', () => {
  it('approves return', async () => {
    const ticket = new ReturnAggregate({
      id: 'return_1',
      status: ReturnStatus.OPEN,
    });

    const repository = {
      findById: jest.fn().mockResolvedValue(ticket),
      save: jest.fn(),
    };

    const service = new ApproveReturnApplicationService(repository);

    const result = await service.execute({
      returnId: 'return_1',
    });

    expect(ticket.status).toBe(ReturnStatus.APPROVED);
    expect(repository.save).toHaveBeenCalledWith(ticket);
    expect(result).toEqual({
      return: ticket,
    });
  });

  it('throws when return is missing', async () => {
    const service = new ApproveReturnApplicationService({
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
