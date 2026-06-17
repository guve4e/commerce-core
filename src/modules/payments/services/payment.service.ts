import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreatePaymentDto) {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          orderId: dto.orderId,
          provider: dto.provider,
          amount: dto.amount,
          currency: dto.currency,
          status: 'captured',
          attempts: {
            create: {
              provider: dto.provider,
              status: 'captured',
              providerReference: `manual-${Date.now()}`,
            },
          },
        },
        include: {
          attempts: true,
        },
      });

      const order = await tx.order.findUnique({
        where: { id: dto.orderId },
        include: { items: true },
      });

      if (order) {
        for (const item of order.items) {
          if (!item.variantId) continue;

          await tx.inventoryItem.update({
            where: { variantId: item.variantId },
            data: {
              quantity: { decrement: item.quantity },
              reservedQuantity: { decrement: item.quantity },
            },
          });
        }

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
      }

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
