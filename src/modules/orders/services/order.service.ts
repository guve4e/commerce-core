import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { OrderAggregate } from '../domain/order.aggregate';
import { CreateOrderDto } from '../dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderDto) {
    const { items, ...orderData } = dto;

    return this.prisma.order.create({
      data: {
        ...orderData,
        items: {
          create: items.map((item) => ({
            variantId: item.variantId,
            sku: item.sku,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        },
        statusHistory: {
          create: {
            status: 'created',
            note: 'Order created',
          },
        },
      },
      include: {
        items: true,
        statusHistory: true,
      },
    });
  }

  async findAll() {
    return this.prisma.order.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.order.findUniqueOrThrow({
      where: {
        id,
      },
    });
  }

  async ship(orderId: string) {
    const order = await this.prisma.order.findUniqueOrThrow({
      where: { id: orderId },
    });

    const aggregate = new OrderAggregate(order);

    aggregate.ship();

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: order.status,
      },
    });
  }

  async deliver(orderId: string) {
    const order = await this.prisma.order.findUniqueOrThrow({
      where: { id: orderId },
    });

    const aggregate = new OrderAggregate(order);

    aggregate.deliver();

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: order.status,
      },
    });
  }
}
