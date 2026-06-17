import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class LegacyCartService {
  constructor(private readonly prisma: PrismaService) {}

  async getAvailableQuantities(userId: string) {
    const cart = await this.getOrCreateCart(userId);

    return cart.items.map((item) => ({
      sku: item.variant.sku,
      qty:
        ((item.variant as any).inventoryItem?.quantity ?? 0) -
        ((item.variant as any).inventoryItem?.reservedQuantity ?? 0),
    }));
  }

  async getCart(userId: string) {
    return this.getOrCreateCart(userId);
  }

  async makeCart(userId: string) {
    return this.getOrCreateCart(userId);
  }

  async addToCart(userId: string, sku: string, qty: number) {
    const cart = await this.getOrCreateCart(userId);
    const variant = await this.findVariantBySku(sku);

    const existing = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        variantId: variant.id,
      },
    });

    if (existing) {
      await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: { increment: qty } },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId: variant.id,
          quantity: qty,
        },
      });
    }

    return this.getOrCreateCart(userId);
  }

  async updateCart(userId: string, sku: string, qty: number) {
    const cart = await this.getOrCreateCart(userId);
    const variant = await this.findVariantBySku(sku);

    const existing = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        variantId: variant.id,
      },
    });

    if (!existing) {
      return this.getOrCreateCart(userId);
    }

    if (qty <= 0) {
      await this.prisma.cartItem.delete({
        where: { id: existing.id },
      });
    } else {
      await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: qty },
      });
    }

    return this.getOrCreateCart(userId);
  }

  async deleteShoppingCart(userId: string) {
    const customer = await this.getOrCreateShadowCustomer(userId);

    const cart = await this.prisma.cart.findFirst({
      where: {
        customerId: customer.id,
        status: 'active',
      },
    });

    if (!cart) {
      return null;
    }

    await this.prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    return this.getOrCreateCart(userId);
  }

  private async getOrCreateCart(userId: string) {
    const customer = await this.getOrCreateShadowCustomer(userId);

    let cart = await this.prisma.cart.findFirst({
      where: {
        customerId: customer.id,
        status: 'active',
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                inventoryItem: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          customerId: customer.id,
        },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  inventoryItem: true,
                },
              },
            },
          },
        },
      });
    }

    return cart;
  }

  private async getOrCreateShadowCustomer(userId: string) {
    const existingCustomer = await this.prisma.customer.findUnique({
      where: { id: userId },
    });

    if (existingCustomer) {
      return existingCustomer;
    }

    const visitor = await this.prisma.visitor.findUnique({
      where: { id: userId },
    });

    if (!visitor) {
      throw new BadRequestException(
        `Legacy cart requires existing customer or visitor id. Got: ${userId}`,
      );
    }

    const existingShadow = await this.prisma.customer.findFirst({
      where: {
        email: `visitor-${visitor.id}@legacy.local`,
      },
    });

    if (existingShadow) {
      return existingShadow;
    }

    return this.prisma.customer.create({
      data: {
        storeId: visitor.storeId,
        email: `visitor-${visitor.id}@legacy.local`,
        firstName: 'Legacy',
        lastName: 'Visitor',
      },
    });
  }

  private async findVariantBySku(sku: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { sku },
    });

    if (!variant) {
      throw new BadRequestException(`SKU not found: ${sku}`);
    }

    return variant;
  }
}
