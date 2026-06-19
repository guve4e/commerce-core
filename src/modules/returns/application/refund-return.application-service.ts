import { ReturnRepository } from '../domain/return.repository';

export interface RefundReturnCommand {
  returnId: string;
}

export class RefundReturnApplicationService {
  constructor(private readonly returnRepository: ReturnRepository) {}

  async execute(command: RefundReturnCommand) {
    const ticket = await this.returnRepository.findById(command.returnId);

    if (!ticket) {
      throw new Error('Return not found');
    }

    ticket.refund();

    await this.returnRepository.save(ticket);

    return {
      return: ticket,
    };
  }
}
