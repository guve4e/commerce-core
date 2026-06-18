import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class LegacyOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async createFromCart(userId: string, company: string, body: any) {
    const customer = await this.getLegacyCustomer(userId);
    const cart = await this.prisma.cart.findFirst({
      where: { customerId: customer.id, status: 'active' },
      include: { items: { include: { variant: true } }, customer: true },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException(`No shopping cart found for user: ${userId}`);
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.variant.price) * item.quantity,
      0,
    );

    const shippingInfo = body?.shippingInfo ?? {};
    const address = shippingInfo?.address ?? {};

    const orderNumber = await this.nextOrderNumber();

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          storeId: customer.storeId,
          customerId: customer.id,

          email: shippingInfo.email ?? customer.email,
          firstName: shippingInfo.firstName ?? shippingInfo.name ?? customer.firstName ?? '',
          lastName: shippingInfo.lastName ?? customer.lastName,
          phone: shippingInfo.phoneNumber ?? customer.phone,

          addressLine1: address.streetName ?? 'Legacy Address',
          addressLine2: address.apartment,
          city: address.city ?? 'Unknown',
          state: address.state,
          postalCode: address.zip,
          country: address.country?.alpha2 ?? address.country ?? 'BG',

          status: 'new',

          subtotal: subtotal.toFixed(2),
          shipping: String(shippingInfo.cost ?? '0'),
          tax: '0',
          total: (subtotal + Number(shippingInfo.cost ?? 0)).toFixed(2),

          items: {
            create: cart.items.map((item) => ({
              variantId: item.variantId,
              sku: item.variant.sku,
              name: item.variant.name,
              price: item.variant.price,
              quantity: item.quantity,
            })),
          },

          statusHistory: {
            create: {
              status: 'new',
              note: `Legacy order created for company ${company}`,
            },
          },
        },
        include: {
          items: true,
          statusHistory: true,
        },
      });

      await tx.cart.update({
        where: { id: cart.id },
        data: { status: 'checked_out' },
      });

      return order;
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

  async changeStatus(orderId: string, status: string, note = '') {
    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        statusHistory: {
          create: {
            status,
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
