import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PromotionAggregate } from '../domain/promotion.aggregate';
import { PromotionRepository } from '../domain/promotion.repository';

@Injectable()
export class PrismaPromotionRepository implements PromotionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<PromotionAggregate | null> {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id },
    });

    if (!promotion) {
      return null;
    }

    return PromotionAggregate.create({
      id: promotion.id,
      storeId: promotion.storeId,
      name: promotion.name,
      status: promotion.status as any,
      discountType: promotion.discountType as any,
      discountValue: Number(promotion.discountValue ?? 0),
      startsAt: promotion.startsAt,
      endsAt: promotion.endsAt,
    });
  }

  async findActiveByStoreId(storeId: string): Promise<PromotionAggregate[]> {
    const now = new Date();

    const promotions = await this.prisma.promotion.findMany({
      where: {
        storeId,
        status: 'active',
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        AND: [
          {
            OR: [{ endsAt: null }, { endsAt: { gt: now } }],
          },
        ],
      },
    });

    return promotions.map((promotion) =>
      PromotionAggregate.create({
        id: promotion.id,
        storeId: promotion.storeId,
        name: promotion.name,
        status: promotion.status as any,
        discountType: promotion.discountType as any,
        discountValue: Number(promotion.discountValue ?? 0),
        startsAt: promotion.startsAt,
        endsAt: promotion.endsAt,
      }),
    );
  }

  async save(aggregate: PromotionAggregate): Promise<void> {
    const snapshot = aggregate.snapshot();

    await this.prisma.promotion.upsert({
      where: { id: snapshot.id },
      create: {
        id: snapshot.id,
        storeId: snapshot.storeId,
        name: snapshot.name,
        status: snapshot.status,
        discountType: snapshot.discountType,
        discountValue: snapshot.discountValue,
        startsAt: snapshot.startsAt,
        endsAt: snapshot.endsAt,
      },
      update: {
        name: snapshot.name,
        status: snapshot.status,
        discountType: snapshot.discountType,
        discountValue: snapshot.discountValue,
        startsAt: snapshot.startsAt,
        endsAt: snapshot.endsAt,
      },
    });
  }
}
