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
            price: variant.price,
            originalPrice: variant.originalPrice,
            currency: variant.currency,
            attributes: variant.attributes,
          })),
        },
      },
      include: {
        variants: true,
      },
    });
  }

  findAll() {
    return this.prisma.product.findMany({
      include: {
        variants: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
      },
    });
  }
}
