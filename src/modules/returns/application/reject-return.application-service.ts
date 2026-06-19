import { ReturnRepository } from '../domain/return.repository';

export interface RejectReturnCommand {
  returnId: string;
}

export class RejectReturnApplicationService {
  constructor(private readonly returnRepository: ReturnRepository) {}

  async execute(command: RejectReturnCommand) {
    const ticket = await this.returnRepository.findById(command.returnId);

    if (!ticket) {
      throw new Error('Return not found');
    }

    ticket.reject();

    await this.returnRepository.save(ticket);

    return {
      return: ticket,
    };
  }
}
