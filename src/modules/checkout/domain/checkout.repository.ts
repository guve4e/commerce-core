import { Repository } from '../../shared/domain/repository.types';
import { CheckoutAggregate } from './checkout.aggregate';

export interface CheckoutRepository
  extends Repository<CheckoutAggregate, string> {}
