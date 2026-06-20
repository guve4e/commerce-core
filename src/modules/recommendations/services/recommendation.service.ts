import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateRecommendationDto } from '../dto/create-recommendation.dto';

@Injectable()
export class RecommendationService {
  constructor(private readonly prisma: PrismaService) {}

  createRecommendation(dto: CreateRecommendationDto) {
    return this.prisma.productRecommendation.upsert({
      where: {
        sourceProductId_targetProductId: {
          sourceProductId: dto.sourceProductId,
          targetProductId: dto.targetProductId,
        },
      },
      create: {
        sourceProductId: dto.sourceProductId,
        targetProductId: dto.targetProductId,
        reason: dto.reason,
        weight: dto.weight ?? 100,
      },
      update: {
        reason: dto.reason,
        weight: dto.weight ?? 100,
      },
    });
  }

  findForProduct(productId: string) {
    return this.prisma.productRecommendation.findMany({
      where: {
        sourceProductId: productId,
      },
      include: {
        targetProduct: {
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
          },
        },
      },
      orderBy: [{ weight: 'desc' }, { createdAt: 'asc' }],
    });
  }
}
