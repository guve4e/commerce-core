import { Repository } from '../../shared/domain/repository.types';
import { VariantAggregate } from './variant.aggregate';

export interface VariantRepository extends Repository<VariantAggregate, string> {
  findBySku(storeId: string, sku: string): Promise<VariantAggregate | null>;
}
