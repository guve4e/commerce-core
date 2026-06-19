import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import type { Outbox } from '../../shared/application/outbox';
import { OUTBOX } from '../../shared/infrastructure/outbox/outbox.module';
import { ReturnAggregate } from '../domain/return.aggregate';
import { ReturnRepository } from '../domain/return.repository';

@Injectable()
export class PrismaReturnRepository implements ReturnRepository {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(OUTBOX)
    private readonly outbox: Outbox,
  ) {}

  async findById(id: string): Promise<ReturnAggregate | null> {
    const ticket = await this.prisma.return.findUnique({
      where: { id },
    });

    return ticket ? this.toAggregate(ticket) : null;
  }

  async save(aggregate: ReturnAggregate): Promise<void> {
    const snapshot = aggregate.snapshot();

    if (!snapshot.id) {
      throw new Error('Return id is required to save');
    }

    await this.prisma.return.update({
      where: { id: snapshot.id },
      data: {
        status: snapshot.status,
      },
    });

    await this.outbox.store(aggregate.pullDomainEvents());
  }

  private toAggregate(ticket: {
    id: string;
    status: string;
  }) {
    return new ReturnAggregate({
      id: ticket.id,
      status: ticket.status,
    });
  }
}
