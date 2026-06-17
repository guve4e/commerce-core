import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreatePaymentDto) {
    return this.prisma.payment.create({
      data: {
        orderId: dto.orderId,
        provider: dto.provider,
        amount: dto.amount,
        currency: dto.currency,
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
