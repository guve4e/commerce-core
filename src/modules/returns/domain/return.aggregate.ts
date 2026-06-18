import { ReturnStatus } from './return-status.enum';

export class ReturnAggregate {
  constructor(
    private readonly ticket: {
      status: string;
    },
  ) {}

  approve() {
    if (this.ticket.status !== ReturnStatus.OPEN) {
      throw new Error(
        `Cannot approve return from status ${this.ticket.status}`,
      );
    }

    this.ticket.status = ReturnStatus.APPROVED;
  }

  reject() {
    if (this.ticket.status !== ReturnStatus.OPEN) {
      throw new Error(
        `Cannot reject return from status ${this.ticket.status}`,
      );
    }

    this.ticket.status = ReturnStatus.REJECTED;
  }

  refund() {
    if (this.ticket.status !== ReturnStatus.APPROVED) {
      throw new Error(
        `Cannot refund return from status ${this.ticket.status}`,
      );
    }

    this.ticket.status = ReturnStatus.REFUNDED;
  }

  get status() {
    return this.ticket.status;
  }
}
