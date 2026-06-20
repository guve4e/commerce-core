import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AddBundleItemDto, CreateBundleDto } from '../dto/create-bundle.dto';

@Injectable()
export class BundleService {
  constructor(private readonly prisma: PrismaService) {}

  createBundle(dto: CreateBundleDto) {
    return this.prisma.productBundle.upsert({
      where: {
        storeId_slug: {
          storeId: dto.storeId,
          slug: dto.slug,
        },
      },
      create: {
        storeId: dto.storeId,
        slug: dto.slug,
        name: dto.name,
        description: dto.description,
        active: dto.active ?? true,
      },
      update: {
        name: dto.name,
        description: dto.description,
        active: dto.active ?? true,
      },
    });
  }

  addBundleItem(bundleId: string, dto: AddBundleItemDto) {
    return this.prisma.productBundleItem.upsert({
      where: {
        bundleId_variantId: {
          bundleId,
          variantId: dto.variantId,
        },
      },
      create: {
        bundleId,
        variantId: dto.variantId,
        quantity: dto.quantity ?? 1,
        sortOrder: dto.sortOrder ?? 0,
      },
      update: {
        quantity: dto.quantity ?? 1,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  findActiveBundles(storeId: string) {
    return this.prisma.productBundle.findMany({
      where: {
        storeId,
        active: true,
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    translations: true,
                    images: true,
                  },
                },
                prices: {
                  include: {
                    priceList: true,
                  },
                },
              },
            },
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}
