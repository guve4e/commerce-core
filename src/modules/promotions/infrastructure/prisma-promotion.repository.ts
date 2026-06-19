import { Injectable } from '@nestjs/common';
import { PromotionAggregate } from '../domain/promotion.aggregate';
import { PromotionRepository } from '../domain/promotion.repository';

@Injectable()
export class PrismaPromotionRepository implements PromotionRepository {
  async findById(_id: string): Promise<PromotionAggregate | null> {
    throw new Error('Promotion persistence is not backed by Prisma schema yet');
  }

  async findActiveByStoreId(_storeId: string): Promise<PromotionAggregate[]> {
    throw new Error('Promotion persistence is not backed by Prisma schema yet');
  }

  async save(_aggregate: PromotionAggregate): Promise<void> {
    throw new Error('Promotion persistence is not backed by Prisma schema yet');
  }
}
