import { Repository } from '../../shared/domain/repository.types';
import { ProductAggregate } from './product.aggregate';

export interface ProductRepository extends Repository<ProductAggregate, string> {
  findBySlug(storeId: string, slug: string): Promise<ProductAggregate | null>;
}
