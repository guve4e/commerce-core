import { Repository } from '../../shared/domain/repository.types';
import { PricingAggregate } from './pricing.aggregate';

export interface PricingRepository extends Repository<PricingAggregate, string> {
  findActiveByStoreVariantAndCurrency(
    storeId: string,
    variantId: string,
    currency: string,
  ): Promise<PricingAggregate | null>;
}
