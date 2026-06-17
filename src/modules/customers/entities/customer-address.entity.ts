import { Address } from '../../../shared/value-objects/address.vo';

export interface CustomerAddress {
  id: string;

  customerId: string;

  address: Address;

  isDefault: boolean;
}
