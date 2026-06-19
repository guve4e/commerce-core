import { Module } from '@nestjs/common';
import { CustomerController } from './controllers/customer.controller';
import { CustomerService } from './services/customer.service';
import { PrismaCustomerRepository } from './infrastructure/prisma-customer.repository';
import { CUSTOMER_REPOSITORY } from './customer.tokens';
import { BlockCustomerApplicationService } from './application/block-customer.application-service';
import { ActivateCustomerApplicationService } from './application/activate-customer.application-service';
import type { CustomerRepository } from './domain/customer.repository';

@Module({
  controllers: [CustomerController],
  providers: [
    CustomerService,
    PrismaCustomerRepository,
    {
      provide: CUSTOMER_REPOSITORY,
      useExisting: PrismaCustomerRepository,
    },
    {
      provide: BlockCustomerApplicationService,
      useFactory: (customerRepository: CustomerRepository) =>
        new BlockCustomerApplicationService(customerRepository),
      inject: [CUSTOMER_REPOSITORY],
    },
    {
      provide: ActivateCustomerApplicationService,
      useFactory: (customerRepository: CustomerRepository) =>
        new ActivateCustomerApplicationService(customerRepository),
      inject: [CUSTOMER_REPOSITORY],
    },
  ],
  exports: [
    CustomerService,
    CUSTOMER_REPOSITORY,
    BlockCustomerApplicationService,
    ActivateCustomerApplicationService,
  ],
})
export class CustomerModule {}
