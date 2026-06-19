import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { CustomerAggregate } from '../domain/customer.aggregate';
import { CustomerStatus } from '../domain/customer-status.enum';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

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
    const customer = await this.prisma.customer.findUniqueOrThrow({
      where: { id },
    });

    const aggregate = new CustomerAggregate(customer);
    aggregate.block();

    return this.prisma.customer.update({
      where: { id },
      data: {
        status: aggregate.status,
      },
    });
  }

  async activate(id: string) {
    const customer = await this.prisma.customer.findUniqueOrThrow({
      where: { id },
    });

    const aggregate = new CustomerAggregate(customer);
    aggregate.activate();

    return this.prisma.customer.update({
      where: { id },
      data: {
        status: aggregate.status,
      },
    });
  }
}
