import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import type { PaymentRepository } from '../domain/payment.repository';
import { PAYMENT_REPOSITORY } from '../payment.tokens';
import type { OrderRepository } from '../../orders/domain/order.repository';
import { ORDER_REPOSITORY } from '../../orders/order.tokens';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: PaymentRepository,
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
  ) {}

  async create(dto: CreatePaymentDto) {
    const payment = await this.prisma.payment.create({
      data: {
        orderId: dto.orderId,
        provider: dto.provider,
        amount: dto.amount,
        currency: dto.currency,
        status: 'pending',
        attempts: {
          create: {
            provider: dto.provider,
            status: 'pending',
            providerReference: `manual-${Date.now()}`,
          },
        },
      },
      include: {
        attempts: true,
      },
    });

    const paymentAggregate = await this.paymentRepository.findById(payment.id);

    if (!paymentAggregate) {
      throw new Error('Payment not found');
    }

    paymentAggregate.capture();

    await this.paymentRepository.save(paymentAggregate);

    await this.prisma.paymentAttempt.updateMany({
      where: {
        paymentId: payment.id,
      },
      data: {
        status: paymentAggregate.status,
      },
    });

    const orderAggregate = await this.orderRepository.findById(dto.orderId);

    if (!orderAggregate) {
      throw new Error('Order not found');
    }

    orderAggregate.pay();

    await this.orderRepository.save(orderAggregate);

    await this.prisma.orderStatusHistory.create({
      data: {
        orderId: dto.orderId,
        status: orderAggregate.status,
        note: 'Payment captured',
      },
    });

    return this.prisma.payment.findUniqueOrThrow({
      where: {
        id: payment.id,
      },
      include: {
        attempts: true,
      },
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
