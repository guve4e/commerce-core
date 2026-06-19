import { ReturnAggregate } from './return.aggregate';
import { ReturnStatus } from './return-status.enum';

describe('ReturnAggregate domain events', () => {
  it('records return.approved', () => {
    const ticket = new ReturnAggregate({
      id: 'return_1',
      status: ReturnStatus.OPEN,
    });

    ticket.approve();

    expect(ticket.peekDomainEvents()).toEqual([
      expect.objectContaining({
        eventName: 'return.approved',
        aggregateId: 'return_1',
        payload: {
          returnId: 'return_1',
        },
      }),
    ]);
  });

  it('records return.rejected', () => {
    const ticket = new ReturnAggregate({
      id: 'return_1',
      status: ReturnStatus.OPEN,
    });

    ticket.reject();

    expect(ticket.peekDomainEvents()).toEqual([
      expect.objectContaining({
        eventName: 'return.rejected',
        aggregateId: 'return_1',
        payload: {
          returnId: 'return_1',
        },
      }),
    ]);
  });

  it('records return.refunded', () => {
    const ticket = new ReturnAggregate({
      id: 'return_1',
      status: ReturnStatus.APPROVED,
    });

    ticket.refund();

    expect(ticket.peekDomainEvents()).toEqual([
      expect.objectContaining({
        eventName: 'return.refunded',
        aggregateId: 'return_1',
        payload: {
          returnId: 'return_1',
        },
      }),
    ]);
  });

  it('does not record return events without return id', () => {
    const ticket = new ReturnAggregate({
      status: ReturnStatus.OPEN,
    });

    ticket.approve();

    expect(ticket.peekDomainEvents()).toEqual([]);
  });
});
