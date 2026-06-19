import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { CustomerAggregate } from '../domain/customer.aggregate';
import { CustomerStatus } from '../domain/customer-status.enum';
import { BlockCustomerApplicationService } from '../application/block-customer.application-service';
import { ActivateCustomerApplicationService } from '../application/activate-customer.application-service';

@Injectable()
export class CustomerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blockCustomerApplicationService: BlockCustomerApplicationService,
    private readonly activateCustomerApplicationService: ActivateCustomerApplicationService,
  ) {}

  create(dto: CreateCustomerDto) {
    const aggregate = new CustomerAggregate({
      status: CustomerStatus.ACTIVE,
      email: dto.email,
    });

    aggregate.assertCanOrder();

    return this.prisma.customer.create({
      data: {
        ...dto,
        status: aggregate.status,
      },
    });
  }

  findAll() {
    return this.prisma.customer.findMany();
  }

  findOne(id: string) {
    return this.prisma.customer.findUnique({
      where: { id },
    });
  }

  async block(id: string) {
    await this.blockCustomerApplicationService.execute({
      customerId: id,
    });

    return this.findOne(id);
  }

  async activate(id: string) {
    await this.activateCustomerApplicationService.execute({
      customerId: id,
    });

    return this.findOne(id);
  }
}
