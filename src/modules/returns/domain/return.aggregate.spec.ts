import { ReturnAggregate } from './return.aggregate';
import { ReturnStatus } from './return-status.enum';

describe('ReturnAggregate', () => {
  it('approves open return', () => {
    const ticket = {
      status: ReturnStatus.OPEN,
    };

    const aggregate = new ReturnAggregate(ticket);

    aggregate.approve();

    expect(ticket.status).toBe(ReturnStatus.APPROVED);
  });

  it('rejects open return', () => {
    const ticket = {
      status: ReturnStatus.OPEN,
    };

    const aggregate = new ReturnAggregate(ticket);

    aggregate.reject();

    expect(ticket.status).toBe(ReturnStatus.REJECTED);
  });

  it('refunds approved return', () => {
    const ticket = {
      status: ReturnStatus.APPROVED,
    };

    const aggregate = new ReturnAggregate(ticket);

    aggregate.refund();

    expect(ticket.status).toBe(ReturnStatus.REFUNDED);
  });

  it('does not refund rejected return', () => {
    const ticket = {
      status: ReturnStatus.REJECTED,
    };

    const aggregate = new ReturnAggregate(ticket);

    expect(() => aggregate.refund()).toThrow();
  });

  it('does not approve refunded return', () => {
    const ticket = {
      status: ReturnStatus.REFUNDED,
    };

    const aggregate = new ReturnAggregate(ticket);

    expect(() => aggregate.approve()).toThrow();
  });
});
