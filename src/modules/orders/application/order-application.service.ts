import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { InventoryService } from '../../inventory/services/inventory.service';
import { OUTBOX } from '../../shared/infrastructure/outbox/outbox.module';
import type { Outbox } from '../../shared/application/outbox';
import { OrderCreatedEvent } from '../domain/events/order-created.event';
import { PricingService } from '../../pricing/services/pricing.service';

@Injectable()
export class OrderApplicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
    private readonly pricingService: PricingService,
    @Inject(OUTBOX)
    private readonly outbox: Outbox,
  ) {}

  async createOrder(dto: any) {
    const cart = await this.prisma.cart.findFirst({
      where: {
        customerId: dto.customerId,
        status: 'active',
      },
      include: {
        customer: true,
        items: {
          include: {
            variant: {
              include: {
                product: true,
                inventoryItem: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      throw new BadRequestException('Active cart not found');
    }

    if (cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    for (const item of cart.items) {
      const inventory = item.variant.inventoryItem;
      const available =
        (inventory?.quantity ?? 0) - (inventory?.reservedQuantity ?? 0);

      if (available < item.quantity) {
        throw new BadRequestException(
          `Insufficient inventory for SKU ${item.variant.sku}`,
        );
      }
    }

    const currency = dto.currency ?? 'EUR';

    const resolvedLines = await Promise.all(
      cart.items.map(async (item) => {
        const resolvedPrice = await this.pricingService.resolveActivePrice(
          cart.customer.storeId,
          item.variantId,
          currency,
        );

        return {
          item,
          resolvedPrice,
          lineSubtotal: resolvedPrice.finalPrice * item.quantity,
        };
      }),
    );

    const subtotal = resolvedLines.reduce((sum, line) => {
      return sum + line.lineSubtotal;
    }, 0);

    const shipping = Number(dto.shipping ?? '0');
    const tax = Number(dto.tax ?? '0');
    const total = subtotal + shipping + tax;

    const order = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          ...(dto.orderNumber ? { orderNumber: dto.orderNumber } : {}),
          storeId: cart.customer.storeId,
          customerId: cart.customerId,

          email: cart.customer.email,
          firstName: cart.customer.firstName ?? '',
          lastName: cart.customer.lastName,
          phone: cart.customer.phone,

          addressLine1: dto.addressLine1,
          addressLine2: dto.addressLine2,
          city: dto.city,
          state: dto.state,
          postalCode: dto.postalCode,
          country: dto.country,

          status: 'created',

          subtotal: subtotal.toFixed(2),
          shipping: shipping.toFixed(2),
          tax: tax.toFixed(2),
          total: total.toFixed(2),

          items: {
            create: resolvedLines.map((line) => ({
              variantId: line.item.variantId,
              sku: line.item.variant.sku,
              name: line.item.variant.name,
              price: line.resolvedPrice.finalPrice,
              quantity: line.item.quantity,
            })),
          },

          statusHistory: {
            create: {
              status: 'created',
              note: dto.statusNote ?? 'Order created',
            },
          },
        },
        include: {
          items: true,
          statusHistory: true,
        },
      });

      for (const item of cart.items) {
        await this.inventoryService.reserve(item.variantId, item.quantity);
      }

      await tx.cart.update({
        where: {
          id: cart.id,
        },
        data: {
          status: 'checked_out',
        },
      });

      return order;
    });

    await this.outbox.store([
      new OrderCreatedEvent({
        orderId: order.id,
        orderNumber: order.orderNumber,
        storeId: order.storeId,
        customerId: order.customerId,
        total: Number(order.total),
        currency,
      }),
    ]);

    return order;
  }
}
