import { Injectable } from '@nestjs/common';

import { OrderAggregate } from './domain/order.aggregate';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async ship(orderId: string) {
    const order = await this.prisma.order.findUniqueOrThrow({
      where: {
        id: orderId,
      },
    });

    const aggregate = new OrderAggregate(order);

    aggregate.ship();

    return this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: order.status,
      },
    });
  }

  async deliver(orderId: string) {
    const order = await this.prisma.order.findUniqueOrThrow({
      where: {
        id: orderId,
      },
    });

    const aggregate = new OrderAggregate(order);

    aggregate.deliver();

    return this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: order.status,
      },
    });
  }
}
