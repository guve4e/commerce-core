import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class LegacyVisitorService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateVisitor(visitorHash: string, body: any) {
    const store = await this.getDefaultStore();

    const existing = await this.prisma.visitor.findFirst({
      where: {
        storeId: store.id,
        hash: visitorHash,
      },
      include: {
        visits: true,
      },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.visitor.create({
      data: {
        storeId: store.id,
        hash: visitorHash,
        sessionId: body?.visit?.sessionId,
        referralCode: body?.couponToken ?? body?.influencerId,
        visits: {
          create: {
            ipAddress: body?.visit?.ipAddress,
            page: body?.visit?.page,
            referrer: body?.visit?.referrer,
            userAgent: body?.visit?.userAgent,
          },
        },
      },
      include: {
        visits: true,
      },
    });
  }

  getByHash(visitorHash: string) {
    return this.prisma.visitor.findFirst({
      where: {
        hash: visitorHash,
      },
      include: {
        visits: true,
      },
    });
  }

  getById(id: string) {
    return this.prisma.visitor.findUnique({
      where: {
        id,
      },
      include: {
        visits: true,
      },
    });
  }

  async addEvent(userId: string, body: any) {
    const visitor = await this.prisma.visitor.findUnique({
      where: {
        id: userId,
      },
    });

    if (!visitor) {
      return null;
    }

    return this.prisma.visit.create({
      data: {
        visitorId: visitor.id,
        page: body?.page,
        referrer: body?.referrer,
        userAgent: body?.userAgent,
      },
    });
  }

  private async getDefaultStore() {
    const existing = await this.prisma.store.findFirst({
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.store.create({
      data: {
        name: 'Legacy Store',
        slug: 'legacy-store',
      },
    });
  }
}
