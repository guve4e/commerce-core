import { Repository } from '../../shared/domain/repository.types';
import { CartAggregate } from './cart.aggregate';

export interface CartRepository extends Repository<CartAggregate, string> {
  findActiveByCustomerId(customerId: string): Promise<CartAggregate | null>;
}
