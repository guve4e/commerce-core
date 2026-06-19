import { Repository } from '../../shared/domain/repository.types';
import { ReturnAggregate } from './return.aggregate';

export interface ReturnRepository extends Repository<ReturnAggregate, string> {}
