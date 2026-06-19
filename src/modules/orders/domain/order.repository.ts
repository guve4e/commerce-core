import { Repository } from '../../shared/domain/repository.types';
import { OrderAggregate } from './order.aggregate';

export interface OrderRepository extends Repository<OrderAggregate, string> {
  findByOrderNumber(orderNumber: number): Promise<OrderAggregate | null>;
}
