import { Repository } from '../../shared/domain/repository.types';
import { PricingAggregate } from './pricing.aggregate';

export interface PricingRepository extends Repository<PricingAggregate, string> {
  findActiveByStoreAndVariant(
    storeId: string,
    variantId: string,
  ): Promise<PricingAggregate | null>;
}
