import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PricingAggregate } from '../domain/pricing.aggregate';
import type { PricingRepository } from '../domain/pricing.repository';
import { PRICING_REPOSITORY } from '../pricing.tokens';

export interface SetDefaultPriceInput {
  id: string;
  storeId: string;
  variantId: string;
  currency: string;
  amount: number;
  compareAtAmount?: number | null;
}

export interface ResolvedPrice {
  variantId: string;
  currency: string;
  regularPrice: number;
  compareAtPrice: number | null;
  finalPrice: number;
  source: 'default' | 'promotion';
  promotionId: string | null;
}

@Injectable()
export class PricingService {
  constructor(
    @Inject(PRICING_REPOSITORY)
    private readonly pricingRepository: PricingRepository,
    private readonly prisma: PrismaService,
  ) {}

  async setDefaultPrice(input: SetDefaultPriceInput) {
    const price = PricingAggregate.create({
      id: input.id,
      storeId: input.storeId,
      variantId: input.variantId,
      currency: input.currency,
      amount: input.amount,
      compareAtAmount: input.compareAtAmount ?? null,
      status: 'active',
    });

    await this.pricingRepository.save(price);

    return price.snapshot();
  }

  async resolveActivePrice(
    storeId: string,
    variantId: string,
    currency: string,
  ): Promise<ResolvedPrice> {
    const price =
      await this.pricingRepository.findActiveByStoreVariantAndCurrency(
        storeId,
        variantId,
        currency,
      );

    if (!price) {
      throw new NotFoundException(
        `Active ${currency} price not found for variant ${variantId}`,
      );
    }

    const snapshot = price.snapshot();
    const regularPrice = snapshot.amount;

    const activePromotionVariant = await this.findBestActivePromotionVariant(
      storeId,
      variantId,
      regularPrice,
    );

    if (!activePromotionVariant) {
      return {
        variantId: snapshot.variantId,
        currency: snapshot.currency,
        regularPrice,
        compareAtPrice: snapshot.compareAtAmount ?? null,
        finalPrice: regularPrice,
        source: 'default',
        promotionId: null,
      };
    }

    const finalPrice = calculatePromotionPrice(
      regularPrice,
      activePromotionVariant,
    );

    return {
      variantId: snapshot.variantId,
      currency: snapshot.currency,
      regularPrice,
      compareAtPrice: snapshot.compareAtAmount ?? null,
      finalPrice,
      source: 'promotion',
      promotionId: activePromotionVariant.promotionId,
    };
  }

  private async findBestActivePromotionVariant(
    storeId: string,
    variantId: string,
    regularPrice: number,
  ) {
    const now = new Date();

    const promotionVariants = await this.prisma.promotionVariant.findMany({
      where: {
        variantId,
        promotion: {
          storeId,
          status: 'active',
          OR: [{ startsAt: null }, { startsAt: { lte: now } }],
          AND: [
            {
              OR: [{ endsAt: null }, { endsAt: { gt: now } }],
            },
          ],
        },
      },
      include: {
        promotion: true,
      },
    });

    if (promotionVariants.length === 0) {
      return null;
    }

    return promotionVariants
      .map((promotionVariant) => ({
        ...promotionVariant,
        calculatedFinalPrice: calculatePromotionPrice(
          regularPrice,
          promotionVariant,
        ),
      }))
      .sort((a, b) => a.calculatedFinalPrice - b.calculatedFinalPrice)[0];
  }
}

function calculatePromotionPrice(
  regularPrice: number,
  promotionVariant: {
    salePrice: unknown;
    discountPercent: unknown;
    fixedDiscount: unknown;
  },
) {
  if (promotionVariant.salePrice !== null) {
    return roundMoney(Number(promotionVariant.salePrice));
  }

  if (promotionVariant.discountPercent !== null) {
    const discount = regularPrice * (Number(promotionVariant.discountPercent) / 100);
    return roundMoney(Math.max(regularPrice - discount, 0));
  }

  if (promotionVariant.fixedDiscount !== null) {
    return roundMoney(Math.max(regularPrice - Number(promotionVariant.fixedDiscount), 0));
  }

  return roundMoney(regularPrice);
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
