import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PricingAggregate } from '../domain/pricing.aggregate';
import { PricingRepository } from '../domain/pricing.repository';

@Injectable()
export class PrismaPricingRepository implements PricingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<PricingAggregate | null> {
    const price = await this.prisma.variantPrice.findUnique({
      where: { id },
      include: { priceList: true },
    });

    if (!price) {
      return null;
    }

    return PricingAggregate.create({
      id: price.id,
      storeId: price.priceList.storeId,
      variantId: price.variantId,
      currency: price.priceList.currency,
      amount: Number(price.regularPrice),
      compareAtAmount: price.compareAtPrice
        ? Number(price.compareAtPrice)
        : null,
      status: price.active ? 'active' : 'disabled',
    });
  }

  async findActiveByStoreVariantAndCurrency(
    storeId: string,
    variantId: string,
    currency: string,
  ): Promise<PricingAggregate | null> {
    const now = new Date();

    const price = await this.prisma.variantPrice.findFirst({
      where: {
        variantId,
        active: true,
        priceList: {
          storeId,
          currency,
          active: true,
        },
        OR: [
          { startsAt: null },
          { startsAt: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { endsAt: null },
              { endsAt: { gt: now } },
            ],
          },
        ],
      },
      include: { priceList: true },
      orderBy: [{ startsAt: 'desc' }, { createdAt: 'desc' }],
    });

    if (!price) {
      return null;
    }

    return PricingAggregate.create({
      id: price.id,
      storeId: price.priceList.storeId,
      variantId: price.variantId,
      currency: price.priceList.currency,
      amount: Number(price.regularPrice),
      compareAtAmount: price.compareAtPrice
        ? Number(price.compareAtPrice)
        : null,
      status: price.active ? 'active' : 'disabled',
    });
  }

  async save(aggregate: PricingAggregate): Promise<void> {
    const snapshot = aggregate.snapshot();

    const priceList = await this.prisma.priceList.upsert({
      where: {
        storeId_name_currency: {
          storeId: snapshot.storeId,
          name: 'Default',
          currency: snapshot.currency,
        },
      },
      create: {
        storeId: snapshot.storeId,
        name: 'Default',
        currency: snapshot.currency,
        active: true,
      },
      update: {
        active: true,
      },
    });

    await this.prisma.variantPrice.upsert({
      where: { id: snapshot.id },
      create: {
        id: snapshot.id,
        variantId: snapshot.variantId,
        priceListId: priceList.id,
        regularPrice: snapshot.amount,
        compareAtPrice: snapshot.compareAtAmount,
        active: snapshot.status === 'active',
      },
      update: {
        priceListId: priceList.id,
        regularPrice: snapshot.amount,
        compareAtPrice: snapshot.compareAtAmount,
        active: snapshot.status === 'active',
      },
    });
  }
}
