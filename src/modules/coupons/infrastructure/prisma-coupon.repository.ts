import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CouponAggregate } from '../domain/coupon.aggregate';
import { CouponRepository } from '../domain/coupon.repository';
import { CouponStatus } from '../domain/coupon-status.enum';

@Injectable()
export class PrismaCouponRepository implements CouponRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<CouponAggregate | null> {
    const coupon = await this.prisma.couponCode.findUnique({
      where: { id },
    });

    return coupon ? this.toAggregate(coupon) : null;
  }

  async findByCode(code: string): Promise<CouponAggregate | null> {
    const coupon = await this.prisma.couponCode.findUnique({
      where: { code },
    });

    return coupon ? this.toAggregate(coupon) : null;
  }

  async save(aggregate: CouponAggregate): Promise<void> {
    const snapshot = aggregate.snapshot();

    if (!snapshot.id) {
      throw new Error('Coupon id is required to save');
    }

    await this.prisma.couponCode.update({
      where: { id: snapshot.id },
      data: {
        active: snapshot.active,
        usedCount: snapshot.usedCount,
      },
    });
  }

  private toAggregate(coupon: {
    id: string;
    code: string;
    active: boolean;
    maxUses: number | null;
    usedCount: number;
    expiresAt: Date | null;
  }) {
    return new CouponAggregate({
      id: coupon.id,
      code: coupon.code,
      active: coupon.active,
      maxUses: coupon.maxUses,
      usedCount: coupon.usedCount,
      expiresAt: coupon.expiresAt,
      status: coupon.active ? CouponStatus.ACTIVE : CouponStatus.DISABLED,
    });
  }
}
