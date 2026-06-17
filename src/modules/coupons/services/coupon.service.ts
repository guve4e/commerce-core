import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCampaignDto } from '../dto/create-campaign.dto';
import { CreateCouponCodeDto } from '../dto/create-coupon-code.dto';

@Injectable()
export class CouponService {
  constructor(private readonly prisma: PrismaService) {}

  createCampaign(dto: CreateCampaignDto) {
    return this.prisma.campaign.create({ data: dto });
  }

  createCode(dto: CreateCouponCodeDto) {
    return this.prisma.couponCode.create({
      data: {
        campaignId: dto.campaignId,
        code: dto.code,
        percentageOff: dto.percentageOff,
        fixedAmountOff: dto.fixedAmountOff,
        maxUses: dto.maxUses,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });
  }

  findCampaigns() {
    return this.prisma.campaign.findMany({
      include: { couponCodes: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findCodes() {
    return this.prisma.couponCode.findMany({
      include: { campaign: true, redemptions: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
