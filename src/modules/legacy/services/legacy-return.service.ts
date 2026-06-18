import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ReturnAggregate } from '../../returns/domain/return.aggregate';
import { ReturnStatus } from '../../returns/domain/return-status.enum';


@Injectable()
export class LegacyReturnService {
  constructor(private readonly prisma: PrismaService) {}

  getAll() {
    return this.prisma.return.findMany({
      include: { items: true, order: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  getById(id: string) {
    return this.prisma.return.findUnique({
      where: { id },
      include: { items: true, order: true },
    });
  }

  async getByOrderNumber(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber: Number(orderNumber) },
    });

    if (!order) return [];

    return this.prisma.return.findMany({
      where: { orderId: order.id },
      include: { items: true, order: true },
    });
  }

  async openReturnTicket(orderNumber: string, returnId: string, body: any) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber: Number(orderNumber) },
      include: { items: true },
    });

    if (!order) {
      throw new BadRequestException(`Order not found: ${orderNumber}`);
    }

    const returnProducts = body?.returnProducts ?? [];

    if (!Array.isArray(returnProducts) || returnProducts.length === 0) {
      throw new BadRequestException('Return products are required');
    }

    const productsRefund = returnProducts.reduce((sum, item) => {
      const orderItem = order.items.find((i) => i.sku === item.sku);

      if (!orderItem) {
        throw new BadRequestException(`SKU not found in order: ${item.sku}`);
      }

      return sum + Number(orderItem.price) * Number(item.quantity);
    }, 0);

    return this.prisma.$transaction(async (tx) => {
      const returnObject = await tx.return.create({
        data: {
          id: returnId || undefined,
          orderId: order.id,
          status: 'OPEN',
          reason: body?.note,
          items: {
            create: returnProducts.map((item) => ({
              sku: item.sku,
              quantity: Number(item.quantity),
              reason: body?.note,
            })),
          },
        },
        include: {
          items: true,
          order: true,
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'return_created',
          statusHistory: {
            create: {
              status: 'return_created',
              note: 'Customer created return ticket',
            },
          },
        },
      });

      return {
        ...returnObject,
        productsRefund: productsRefund.toFixed(2),
        tax: '0.00',
        totalRefund: productsRefund.toFixed(2),
      };
    });
  }

  async changeState(returnId: string, state: string, note?: string) {
    const statusMap: Record<string, string> = {
      APPROVED: 'return_approved',
      REJECTED: 'return_declined',
      REFUNDED: 'return_refunded',
    };

    const orderStatus = statusMap[state];

    if (!orderStatus) {
      throw new BadRequestException(`Unsupported return state: ${state}`);
    }

    const existing = await this.prisma.return.findUnique({
      where: { id: returnId },
    });

    if (!existing) {
      throw new BadRequestException(`Return not found: ${returnId}`);
    }

    const aggregate = new ReturnAggregate(existing);

    switch (state) {
      case ReturnStatus.APPROVED:
        aggregate.approve();
        break;

      case ReturnStatus.REJECTED:
        aggregate.reject();
        break;

      case ReturnStatus.REFUNDED:
        aggregate.refund();
        break;

      default:
        throw new BadRequestException(`Unsupported return state: ${state}`);
    }

    if (!existing) {
      throw new BadRequestException(`Return not found: ${returnId}`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedReturn = await tx.return.update({
        where: { id: returnId },
        data: {
          status: aggregate.status,
        },
        include: {
          items: true,
          order: true,
        },
      });

      await tx.order.update({
        where: { id: existing.orderId },
        data: {
          status: orderStatus,
          statusHistory: {
            create: {
              status: orderStatus,
              note,
            },
          },
        },
      });

      return updatedReturn;
    });
  }
}
