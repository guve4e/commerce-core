import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CheckoutDto } from '../dto/checkout.dto';

@Injectable()
export class CheckoutService {
  constructor(private readonly prisma: PrismaService) {}

  async checkout(dto: CheckoutDto) {
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

    const subtotal = cart.items.reduce((sum, item) => {
      return sum + Number(item.variant.price) * item.quantity;
    }, 0);

    const shipping = Number(dto.shipping ?? '0');
    const tax = Number(dto.tax ?? '0');
    const total = subtotal + shipping + tax;

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
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
              status: 'created',
              note: 'Checkout created order',
            },
          },
        },
        include: {
          items: true,
          statusHistory: true,
        },
      });

      for (const item of cart.items) {
        await tx.inventoryItem.update({
          where: {
            variantId: item.variantId,
          },
          data: {
            reservedQuantity: {
              increment: item.quantity,
            },
          },
        });
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
  }
}
