import { Repository } from '../../shared/domain/repository.types';
import { CustomerAggregate } from './customer.aggregate';

export interface CustomerRepository extends Repository<CustomerAggregate, string> {
  findByEmail(email: string): Promise<CustomerAggregate | null>;
}
