import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CustomerAggregate } from '../domain/customer.aggregate';
import { CustomerRepository } from '../domain/customer.repository';

@Injectable()
export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<CustomerAggregate | null> {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    return customer ? this.toAggregate(customer) : null;
  }

  async findByEmail(email: string): Promise<CustomerAggregate | null> {
    const customer = await this.prisma.customer.findFirst({
      where: { email },
    });

    return customer ? this.toAggregate(customer) : null;
  }

  async save(aggregate: CustomerAggregate): Promise<void> {
    const snapshot = aggregate.snapshot();

    if (!snapshot.id) {
      throw new Error('Customer id is required to save');
    }

    await this.prisma.customer.update({
      where: { id: snapshot.id },
      data: {
        status: snapshot.status,
        ...(snapshot.email ? { email: snapshot.email } : {}),
      },
    });
  }

  private toAggregate(customer: {
    id: string;
    status: string;
    email: string | null;
  }) {
    return new CustomerAggregate({
      id: customer.id,
      status: customer.status,
      email: customer.email,
    });
  }
}
