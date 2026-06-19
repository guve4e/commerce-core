import { Repository } from '../../shared/domain/repository.types';
import { StoreAggregate } from './store.aggregate';

export interface StoreRepository extends Repository<StoreAggregate, string> {
  findBySlug(slug: string): Promise<StoreAggregate | null>;
}
