import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AuroraRecommendationService {
  constructor(private readonly prisma: PrismaService) {}

  async recommendForCustomer(customerId: string) {
    const profile = await this.prisma.customerProfile.findUnique({
      where: { customerId },
      include: {
        skinTypes: { include: { skinType: true } },
        skinConcerns: { include: { concern: true } },
        sensitivities: { include: { ingredient: true } },
      },
    });

    if (!profile) {
      throw new NotFoundException(`Customer profile not found: ${customerId}`);
    }

    const skinTypeIds = profile.skinTypes.map((item) => item.skinTypeId);
    const concernIds = profile.skinConcerns.map((item) => item.concernId);
    const sensitiveIngredientIds = profile.sensitivities.map(
      (item) => item.ingredientId,
    );

    const products = await this.prisma.product.findMany({
      where: {
        status: 'active',
        AND: [
          skinTypeIds.length
            ? {
                skinTypes: {
                  some: {
                    skinTypeId: { in: skinTypeIds },
                  },
                },
              }
            : {},
          concernIds.length
            ? {
                concerns: {
                  some: {
                    concernId: { in: concernIds },
                  },
                },
              }
            : {},
          sensitiveIngredientIds.length
            ? {
                ingredients: {
                  none: {
                    ingredientId: { in: sensitiveIngredientIds },
                  },
                },
              }
            : {},
        ],
      },
      include: {
        translations: true,
        images: true,
        variants: {
          include: {
            prices: {
              include: {
                priceList: true,
              },
            },
          },
        },
        concerns: {
          include: {
            concern: true,
          },
        },
        skinTypes: {
          include: {
            skinType: true,
          },
        },
        ingredients: {
          include: {
            ingredient: true,
          },
        },
        benefitAssignments: {
          include: {
            benefit: true,
          },
        },
      },
    });

    return products.map((product) => ({
      product,
      score: this.scoreProduct(product, skinTypeIds, concernIds),
      reasons: this.buildReasons(product, skinTypeIds, concernIds),
    })).sort((a, b) => b.score - a.score);
  }

  private scoreProduct(product: any, skinTypeIds: string[], concernIds: string[]) {
    let score = 0;

    for (const skinType of product.skinTypes) {
      if (skinTypeIds.includes(skinType.skinTypeId)) {
        score += skinType.strength ?? 1;
      }
    }

    for (const concern of product.concerns) {
      if (concernIds.includes(concern.concernId)) {
        score += (concern.strength ?? 1) * 2;
      }
    }

    return score;
  }

  private buildReasons(product: any, skinTypeIds: string[], concernIds: string[]) {
    const reasons: string[] = [];

    for (const skinType of product.skinTypes) {
      if (skinTypeIds.includes(skinType.skinTypeId)) {
        reasons.push(`Matches skin type: ${skinType.skinType.name}`);
      }
    }

    for (const concern of product.concerns) {
      if (concernIds.includes(concern.concernId)) {
        reasons.push(`Targets concern: ${concern.concern.name}`);
      }
    }

    return reasons;
  }
}
