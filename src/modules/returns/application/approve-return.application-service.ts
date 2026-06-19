import { ReturnRepository } from '../domain/return.repository';

export interface ApproveReturnCommand {
  returnId: string;
}

export class ApproveReturnApplicationService {
  constructor(private readonly returnRepository: ReturnRepository) {}

  async execute(command: ApproveReturnCommand) {
    const ticket = await this.returnRepository.findById(command.returnId);

    if (!ticket) {
      throw new Error('Return not found');
    }

    ticket.approve();

    await this.returnRepository.save(ticket);

    return {
      return: ticket,
    };
  }
}
