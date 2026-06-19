import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AddCartItemDto } from '../dto/add-cart-item.dto';
import { CartAggregate } from '../domain/cart.aggregate';
import { CartStatus } from '../domain/cart-status.enum';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreate(customerId: string) {
    let cart = await this.prisma.cart.findFirst({
      where: {
        customerId,
        status: CartStatus.ACTIVE,
      },
      include: {
        couponCode: true,
        items: {
          include: {
            variant: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          customerId,
          status: CartStatus.ACTIVE,
        },
        include: {
          couponCode: true,
          items: {
            include: {
              variant: true,
            },
          },
        },
      });
    }

    return cart;
  }

  async addItem(dto: AddCartItemDto) {
    const cart = await this.getOrCreate(dto.customerId);

    const aggregate = new CartAggregate(cart);
    aggregate.assertActive();

    const existing = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        variantId: dto.variantId,
      },
    });

    if (existing) {
      return this.prisma.cartItem.update({
        where: {
          id: existing.id,
        },
        data: {
          quantity: {
            increment: dto.quantity,
          },
        },
      });
    }

    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        variantId: dto.variantId,
        quantity: dto.quantity,
      },
    });
  }
}
