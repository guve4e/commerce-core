import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { CapturePaymentApplicationService } from '../application/capture-payment.application-service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly capturePaymentApplicationService: CapturePaymentApplicationService,
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

    const { payment: paymentAggregate, order } =
      await this.capturePaymentApplicationService.execute({
        paymentId: payment.id,
        orderId: dto.orderId,
      });

    await this.prisma.paymentAttempt.updateMany({
      where: {
        paymentId: payment.id,
      },
      data: {
        status: paymentAggregate.status,
      },
    });

    await this.prisma.orderStatusHistory.create({
      data: {
        orderId: dto.orderId,
        status: order.status,
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
