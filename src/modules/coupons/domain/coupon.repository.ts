import { Repository } from '../../shared/domain/repository.types';
import { CouponAggregate } from './coupon.aggregate';

export interface CouponRepository
  extends Repository<CouponAggregate, string> {

  findByCode(code: string): Promise<CouponAggregate | null>;
}
