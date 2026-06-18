import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class LegacyCouponService {
  constructor(private readonly prisma: PrismaService) {}

  getByToken(token: string) {
    return this.prisma.couponCode.findFirst({
      where: {
        code: token,
        active: true,
      },
      include: {
        campaign: true,
      },
    });
  }

  async getPublicCoupons(company: string) {
    const store = await this.findStoreByCompany(company);

    if (!store) {
      return [];
    }

    return this.prisma.couponCode.findMany({
      where: {
        active: true,
        campaign: {
          storeId: store.id,
          active: true,
        },
      },
      include: {
        campaign: true,
      },
    });
  }

  async applyCoupon(userId: string, couponToken: string) {
    const coupon = await this.getByToken(couponToken);

    if (!coupon) {
      throw new BadRequestException(`Coupon not found: ${couponToken}`);
    }

    const customer = await this.getOrCreateShadowCustomer(userId);

    const cart = await this.prisma.cart.findFirst({
      where: {
        customerId: customer.id,
        status: 'active',
      },
      include: {
        items: {
          include: {
            variant: true,
          },
        },
      },
    });

    if (!cart) {
      throw new BadRequestException(`Cart not found for user: ${userId}`);
    }

    return {
      ...cart,
      legacyAppliedCoupon: coupon,
    };
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
        `Legacy coupon requires existing customer or visitor id. Got: ${userId}`,
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

  private async findStoreByCompany(company: string) {
    const normalized = company.toLowerCase();

    const found = await this.prisma.store.findFirst({
      where: {
        OR: [
          { slug: normalized },
          { name: { equals: company, mode: 'insensitive' } },
        ],
      },
    });

    if (found) {
      return found;
    }

    return this.prisma.store.findFirst({
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}
