import { Repository } from '../../shared/domain/repository.types';
import { InventoryAggregate } from './inventory.aggregate';

export interface InventoryRepository
  extends Repository<InventoryAggregate, string> {
  findByVariantId(variantId: string): Promise<InventoryAggregate | null>;
}
