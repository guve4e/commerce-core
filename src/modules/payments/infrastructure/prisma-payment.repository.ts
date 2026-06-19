import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import type { Outbox } from '../../shared/application/outbox';
import { OUTBOX } from '../../shared/infrastructure/outbox/outbox.module';
import { PaymentAggregate } from '../domain/payment.aggregate';
import { PaymentRepository } from '../domain/payment.repository';

@Injectable()
export class PrismaPaymentRepository implements PaymentRepository {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(OUTBOX)
    private readonly outbox: Outbox,
  ) {}

  async findById(id: string): Promise<PaymentAggregate | null> {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    return payment ? this.toAggregate(payment) : null;
  }

  async save(aggregate: PaymentAggregate): Promise<void> {
    const snapshot = aggregate.snapshot();

    if (!snapshot.id) {
      throw new Error('Payment id is required to save');
    }

    await this.prisma.payment.update({
      where: { id: snapshot.id },
      data: {
        status: snapshot.status,
      },
    });

    await this.outbox.store(aggregate.pullDomainEvents());
  }

  private toAggregate(payment: {
    id: string;
    status: string;
  }) {
    return new PaymentAggregate({
      id: payment.id,
      status: payment.status,
    });
  }
}
