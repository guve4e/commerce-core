import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class LegacyProductService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllByCompany(company: string) {
    const store = await this.findStoreByCompany(company);

    if (!store) {
      return [];
    }

    return this.prisma.product.findMany({
      where: {
        storeId: store.id,
      },
      include: {
        variants: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getByGroup(group: string) {
    return this.prisma.product.findMany({
      where: {
        slug: group,
      },
      include: {
        variants: true,
      },
    });
  }

  async getByCompanyAndGroup(company: string, group: string) {
    const store = await this.findStoreByCompany(company);

    if (!store) {
      return null;
    }

    return this.prisma.product.findFirst({
      where: {
        storeId: store.id,
        slug: group,
      },
      include: {
        variants: true,
      },
    });
  }

  async getProductNames(company: string) {
    const products = await this.getAllByCompany(company);

    return products.map((product) => ({
      group: product.slug,
      name: product.name,
    }));
  }

  private findStoreByCompany(company: string) {
    return this.prisma.store.findFirst({
      where: {
        OR: [
          { slug: company.toLowerCase() },
          { slug: `smoke-store-${company.toLowerCase()}` },
          { name: { equals: company, mode: 'insensitive' } },
        ],
      },
    });
  }
}
