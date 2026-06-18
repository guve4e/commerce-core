import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentAggregate } from '../domain/payment.aggregate';
import { OrderAggregate } from '../../orders/domain/order.aggregate';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreatePaymentDto) {
    return this.prisma.$transaction(async (tx) => {
      const rawPayment = {
        status: 'pending',
      };

      const aggregate = new PaymentAggregate(rawPayment);
      aggregate.capture();

      const payment = await tx.payment.create({
        data: {
          orderId: dto.orderId,
          provider: dto.provider,
          amount: dto.amount,
          currency: dto.currency,
          status: aggregate.status,
          attempts: {
            create: {
              provider: dto.provider,
              status: aggregate.status,
              providerReference: `manual-${Date.now()}`,
            },
          },
        },
        include: {
          attempts: true,
        },
      });

      const order = await tx.order.findUniqueOrThrow({
        where: {
          id: dto.orderId,
        },
      });

      const orderAggregate = new OrderAggregate(order);

      orderAggregate.pay();


      await tx.order.update({
        where: {
          id: dto.orderId,
        },
        data: {
          status: orderAggregate.status,
          statusHistory: {
            create: {
              status: orderAggregate.status,
              note: 'Payment captured',
            },
          },
        },
      });

      return payment;
    });
  }

  findAll() {
    return this.prisma.payment.findMany({
      include: {
        attempts: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findOne(id: string) {
    return this.prisma.payment.findUnique({
      where: {
        id,
      },
      include: {
        attempts: true,
        order: true,
      },
    });
  }
}
