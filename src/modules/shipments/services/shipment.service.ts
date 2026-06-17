import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateShipmentDto } from '../dto/create-shipment.dto';

@Injectable()
export class ShipmentService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateShipmentDto) {
    return this.prisma.shipment.create({
      data: {
        orderId: dto.orderId,
        provider: dto.provider,
        trackingNumber: dto.trackingNumber,
        status: 'pending',
        events: {
          create: {
            status: 'pending',
            message: 'Shipment created',
          },
        },
      },
      include: {
        events: true,
      },
    });
  }

  findAll() {
    return this.prisma.shipment.findMany({
      include: { events: true, order: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.shipment.findUnique({
      where: { id },
      include: { events: true, order: true },
    });
  }
}
