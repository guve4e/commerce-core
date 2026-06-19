import { Repository } from '../../shared/domain/repository.types';
import { ShipmentAggregate } from './shipment.aggregate';

export interface ShipmentRepository
  extends Repository<ShipmentAggregate, string> {}
