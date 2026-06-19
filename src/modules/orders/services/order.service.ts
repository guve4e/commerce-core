import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { InventoryService } from 'src/modules/inventory/services/inventory.service';
import type { OrderRepository } from '../domain/order.repository';
import { ORDER_REPOSITORY } from '../order.tokens';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
  ) {}

  async create(dto: CreateOrderDto) {
    const { items, ...orderData } = dto;

    return this.prisma.order.create({
      data: {
        ...orderData,
        items: {
          create: items.map((item) => ({
            variant: {
              connect: {
                id: item.variantId,
              },
            },
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
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    order.ship();

    await this.orderRepository.save(order);

    const updatedOrder = await this.prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      include: {
        items: true,
        statusHistory: true,
      },
    });

    for (const item of updatedOrder.items) {
      if (!item.variantId) {
        throw new Error(`Order item ${item.id} has no variantId`);
      }

      await this.inventoryService.consume(item.variantId, item.quantity);
    }

    return updatedOrder;
  }

  async cancel(orderId: string) {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    order.cancel();

    await this.orderRepository.save(order);

    const updatedOrder = await this.prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      include: {
        items: true,
        statusHistory: true,
      },
    });

    for (const item of updatedOrder.items) {
      await this.inventoryService.release(item.variantId!, item.quantity);
    }

    return updatedOrder;
  }

  async deliver(orderId: string) {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    order.deliver();

    await this.orderRepository.save(order);

    return this.prisma.order.findUniqueOrThrow({
      where: { id: orderId },
    });
  }
}
