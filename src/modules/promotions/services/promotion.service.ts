import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PromotionAggregate } from '../domain/promotion.aggregate';
import type { PromotionRepository } from '../domain/promotion.repository';
import { PROMOTION_REPOSITORY } from '../promotions.tokens';
import { CreatePromotionDto } from '../dto/create-promotion.dto';

@Injectable()
export class PromotionService {
  constructor(
    @Inject(PROMOTION_REPOSITORY)
    private readonly promotionRepository: PromotionRepository,
    private readonly prisma: PrismaService,
  ) {}

  async createPromotion(dto: CreatePromotionDto) {
    const promotion = PromotionAggregate.create({
      id: dto.id,
      storeId: dto.storeId,
      name: dto.name,
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
    });

    if (dto.activate) {
      promotion.activate();
    }

    await this.promotionRepository.save(promotion);

    return promotion.snapshot();
  }

  async activatePromotion(id: string) {
    const promotion = await this.promotionRepository.findById(id);

    if (!promotion) {
      throw new Error(`Promotion not found: ${id}`);
    }

    promotion.activate();
    await this.promotionRepository.save(promotion);

    return promotion.snapshot();
  }

  async assignVariant(input: {
    promotionId: string;
    variantId: string;
    salePrice?: number | null;
    discountPercent?: number | null;
    fixedDiscount?: number | null;
  }) {
    return this.prisma.promotionVariant.upsert({
      where: {
        promotionId_variantId: {
          promotionId: input.promotionId,
          variantId: input.variantId,
        },
      },
      create: {
        promotionId: input.promotionId,
        variantId: input.variantId,
        salePrice: input.salePrice ?? null,
        discountPercent: input.discountPercent ?? null,
        fixedDiscount: input.fixedDiscount ?? null,
      },
      update: {
        salePrice: input.salePrice ?? null,
        discountPercent: input.discountPercent ?? null,
        fixedDiscount: input.fixedDiscount ?? null,
      },
    });
  }
}
