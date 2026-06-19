import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import type { Outbox } from '../../shared/application/outbox';
import { OUTBOX } from '../../shared/infrastructure/outbox/outbox.module';
import { OrderAggregate } from '../domain/order.aggregate';
import { OrderRepository } from '../domain/order.repository';

@Injectable()
export class PrismaOrderRepository implements OrderRepository {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(OUTBOX)
    private readonly outbox: Outbox,
  ) {}

  async findById(id: string): Promise<OrderAggregate | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    return order ? this.toAggregate(order) : null;
  }

  async findByOrderNumber(orderNumber: number): Promise<OrderAggregate | null> {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
    });

    return order ? this.toAggregate(order) : null;
  }

  async save(aggregate: OrderAggregate): Promise<void> {
    const snapshot = aggregate.snapshot();

    if (!snapshot.id) {
      throw new Error('Order id is required to save');
    }

    await this.prisma.order.update({
      where: { id: snapshot.id },
      data: {
        status: snapshot.status,
      },
    });

    await this.outbox.store(aggregate.pullDomainEvents());
  }

  private toAggregate(order: {
    id: string;
    orderNumber: number | null;
    status: string;
  }) {
    return new OrderAggregate({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
    });
  }
}
