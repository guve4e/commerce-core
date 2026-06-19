import { DomainEventRecorder } from '../../shared/domain/events/domain-event-recorder';
import { ReturnApprovedEvent } from './events/return-approved.event';
import { ReturnRefundedEvent } from './events/return-refunded.event';
import { ReturnRejectedEvent } from './events/return-rejected.event';
import { ReturnStatus } from './return-status.enum';

export class ReturnAggregate extends DomainEventRecorder {
  constructor(
    private readonly ticket: {
      id?: string;
      status: string;
    },
  ) {
    super();
  }

  approve() {
    if (this.ticket.status !== ReturnStatus.OPEN) {
      throw new Error(`Cannot approve return from status ${this.ticket.status}`);
    }

    this.ticket.status = ReturnStatus.APPROVED;

    if (this.ticket.id) {
      this.record(new ReturnApprovedEvent({ returnId: this.ticket.id }));
    }
  }

  reject() {
    if (this.ticket.status !== ReturnStatus.OPEN) {
      throw new Error(`Cannot reject return from status ${this.ticket.status}`);
    }

    this.ticket.status = ReturnStatus.REJECTED;

    if (this.ticket.id) {
      this.record(new ReturnRejectedEvent({ returnId: this.ticket.id }));
    }
  }

  refund() {
    if (this.ticket.status !== ReturnStatus.APPROVED) {
      throw new Error(`Cannot refund return from status ${this.ticket.status}`);
    }

    this.ticket.status = ReturnStatus.REFUNDED;

    if (this.ticket.id) {
      this.record(new ReturnRefundedEvent({ returnId: this.ticket.id }));
    }
  }

  snapshot() {
    return {
      id: this.ticket.id,
      status: this.ticket.status,
    };
  }

  get status() {
    return this.ticket.status;
  }
}
