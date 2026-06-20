import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateProductDto } from '../dto/create-product.dto';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  createProduct(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        storeId: dto.storeId,
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        status: dto.status ?? 'draft',
        variants: {
          create: dto.variants.map((variant) => ({
            sku: variant.sku,
            name: variant.name,
            attributes: variant.attributes,
          })),
        },
      },
      include: {
        variants: true,
        translations: true,
        images: true,
      },
    });
  }

  findAll() {
    return this.prisma.product.findMany({
      include: {
        variants: {
          include: {
            prices: {
              include: {
                priceList: true,
              },
            },
            inventoryItem: true,
            promotionVariants: {
              include: {
                promotion: true,
              },
            },
          },
        },
        translations: true,
        images: true,
        categoryAssignments: {
          include: {
            category: true,
          },
        },
        tagAssignments: {
          include: {
            tag: true,
          },
        },
        concerns: {
          include: {
            concern: true,
          },
        },
        benefits: true,
        benefitAssignments: {
          include: {
            benefit: true,
          },
        },
        ingredients: {
          include: {
            ingredient: true,
          },
        },
        skinTypes: {
          include: {
            skinType: true,
          },
        },
        routineSteps: {
          include: {
            routineStep: true,
          },
        },
        contraindications: {
          include: {
            contraindication: true,
          },
        },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          include: {
            prices: {
              include: {
                priceList: true,
              },
            },
            inventoryItem: true,
            promotionVariants: {
              include: {
                promotion: true,
              },
            },
          },
        },
        translations: true,
        images: true,
        categoryAssignments: {
          include: {
            category: true,
          },
        },
        tagAssignments: {
          include: {
            tag: true,
          },
        },
        concerns: {
          include: {
            concern: true,
          },
        },
        benefits: true,
        benefitAssignments: {
          include: {
            benefit: true,
          },
        },
        ingredients: {
          include: {
            ingredient: true,
          },
        },
        skinTypes: {
          include: {
            skinType: true,
          },
        },
        routineSteps: {
          include: {
            routineStep: true,
          },
        },
        contraindications: {
          include: {
            contraindication: true,
          },
        },
      },
    });
  }
}
