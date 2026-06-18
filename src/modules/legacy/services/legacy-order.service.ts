import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { OrderService } from '../../orders/services/order.service';
import { OrderApplicationService } from '../../orders/application/order-application.service';

@Injectable()
export class LegacyOrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderService: OrderService,
    private readonly orderApplicationService: OrderApplicationService,
  ) {}

  async createFromCart(userId: string, company: string, body: any) {
    const customer = await this.getLegacyCustomer(userId);
    const orderNumber = await this.nextOrderNumber();

    return this.orderApplicationService.createOrder({
      customerId: customer.id,

      orderNumber,

      addressLine1: body.shippingInfo.address.streetName,
      city: body.shippingInfo.address.city,
      postalCode: body.shippingInfo.address.zip,
      country: body.shippingInfo.address.country,

      shipping: body.shippingInfo.cost,

      statusNote: `Legacy order created for company ${company}`,
    });
  }

  getById(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: { items: true, statusHistory: true },
    });
  }

  getByOrderNumber(orderNumber: string) {
    return this.prisma.order.findUnique({
      where: { orderNumber: Number(orderNumber) },
      include: { items: true, statusHistory: true },
    });
  }

  async getByOrderNumberAndZip(orderNumber: string, zipCode: string) {
    const order = await this.getByOrderNumber(orderNumber);

    if (!order || order.postalCode !== zipCode) {
      return null;
    }

    return order;
  }

  async ship(orderId: string, note = '') {
    const order = await this.orderService.ship(orderId);

    await this.prisma.orderStatusHistory.create({
      data: {
        orderId,
        status: order.status,
        note,
      },
    });

    return this.getById(orderId);
  }

  async deliver(orderId: string, note = '') {
    const order = await this.orderService.deliver(orderId);

    await this.prisma.orderStatusHistory.create({
      data: {
        orderId,
        status: order.status,
        note,
      },
    });

    return this.getById(orderId);
  }

  async cancel(orderId: string, note = '') {
    const order = await this.orderService.cancel(orderId);

    await this.prisma.orderStatusHistory.create({
      data: {
        orderId,
        status: order.status,
        note,
      },
    });

    return this.getById(orderId);
  }

  async changeStatus(orderId: string, status: string, note = '') {
    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus === 'cancelled' || normalizedStatus === 'canceled') {
      return this.cancel(orderId, note);
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: normalizedStatus,
        statusHistory: {
          create: {
            status: normalizedStatus,
            note,
          },
        },
      },
      include: {
        items: true,
        statusHistory: true,
      },
    });
  }

  private async getLegacyCustomer(userId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: userId },
    });

    if (customer) return customer;

    const visitor = await this.prisma.visitor.findUnique({
      where: { id: userId },
    });

    if (!visitor) {
      throw new BadRequestException(`Unknown legacy user id: ${userId}`);
    }

    const shadow = await this.prisma.customer.findFirst({
      where: { email: `visitor-${visitor.id}@legacy.local` },
    });

    if (shadow) return shadow;

    return this.prisma.customer.create({
      data: {
        storeId: visitor.storeId,
        email: `visitor-${visitor.id}@legacy.local`,
        firstName: 'Legacy',
        lastName: 'Visitor',
      },
    });
  }

  private async nextOrderNumber() {
    const last = await this.prisma.order.findFirst({
      where: { orderNumber: { not: null } },
      orderBy: { orderNumber: 'desc' },
    });

    return (last?.orderNumber ?? 1000) + 1;
  }
}
