import { Repository } from '../../shared/domain/repository.types';
import { PaymentAggregate } from './payment.aggregate';

export interface PaymentRepository extends Repository<PaymentAggregate, string> {}
