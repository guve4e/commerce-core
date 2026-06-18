import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { SearchProductsDto } from '../dto/search-products.dto';

@Injectable()
export class AssistantCommerceService {
  constructor(private readonly prisma: PrismaService) {}

  async searchProducts(dto: SearchProductsDto) {
    const limit = dto.limit ?? 10;

    return this.prisma.product.findMany({
      where: {
        ...(dto.storeId ? { storeId: dto.storeId } : {}),
        OR: [
          {
            name: {
              contains: dto.query,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: dto.query,
              mode: 'insensitive',
            },
          },
          {
            slug: {
              contains: dto.query,
              mode: 'insensitive',
            },
          },
          {
            variants: {
              some: {
                sku: {
                  contains: dto.query,
                  mode: 'insensitive',
                },
              },
            },
          },
        ],
      },
      include: {
        variants: {
          include: {
            inventoryItem: true,
          },
        },
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
