import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CartAggregate } from '../domain/cart.aggregate';
import { CartRepository } from '../domain/cart.repository';
import { CartStatus } from '../domain/cart-status.enum';

@Injectable()
export class PrismaCartRepository implements CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<CartAggregate | null> {
    const cart = await this.prisma.cart.findUnique({
      where: { id },
    });

    return cart ? this.toAggregate(cart) : null;
  }

  async findActiveByCustomerId(customerId: string): Promise<CartAggregate | null> {
    const cart = await this.prisma.cart.findFirst({
      where: {
        customerId,
        status: CartStatus.ACTIVE,
      },
    });

    return cart ? this.toAggregate(cart) : null;
  }

  async save(aggregate: CartAggregate): Promise<void> {
    const snapshot = aggregate.snapshot();

    if (!snapshot.id) {
      throw new Error('Cart id is required to save');
    }

    await this.prisma.cart.update({
      where: { id: snapshot.id },
      data: {
        status: snapshot.status,
      },
    });
  }

  private toAggregate(cart: {
    id: string;
    customerId: string;
    status: string;
  }) {
    return new CartAggregate({
      id: cart.id,
      customerId: cart.customerId,
      status: cart.status,
    });
  }
}
