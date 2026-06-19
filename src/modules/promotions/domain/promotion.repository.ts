import { Repository } from '../../shared/domain/repository.types';
import { PromotionAggregate } from './promotion.aggregate';

export interface PromotionRepository
  extends Repository<PromotionAggregate, string> {
  findActiveByStoreId(storeId: string): Promise<PromotionAggregate[]>;
}
