import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentAggregate } from '../domain/payment.aggregate';

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

      await tx.order.update({
        where: { id: dto.orderId },
        data: {
          status: 'paid',
          statusHistory: {
            create: {
              status: 'paid',
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
