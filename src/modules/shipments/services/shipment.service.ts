import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateShipmentDto } from '../dto/create-shipment.dto';
import { ShipmentStatus } from '../domain/shipment-status.enum';
import type { ShipmentRepository } from '../domain/shipment.repository';
import { SHIPMENT_REPOSITORY } from '../shipment.tokens';

@Injectable()
export class ShipmentService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(SHIPMENT_REPOSITORY)
    private readonly shipmentRepository: ShipmentRepository,
  ) {}

  create(dto: CreateShipmentDto) {
    return this.prisma.shipment.create({
      data: {
        orderId: dto.orderId,
        provider: dto.provider,
        trackingNumber: dto.trackingNumber,
        status: ShipmentStatus.PENDING,
        events: {
          create: {
            status: ShipmentStatus.PENDING,
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

  async ship(id: string) {
    const shipment = await this.shipmentRepository.findById(id);

    if (!shipment) {
      throw new Error('Shipment not found');
    }

    shipment.ship();

    await this.shipmentRepository.save(shipment);

    return this.prisma.shipment.update({
      where: { id },
      data: {
        shippedAt: new Date(),
        events: {
          create: {
            status: shipment.status,
            message: 'Shipment shipped',
          },
        },
      },
      include: {
        events: true,
        order: true,
      },
    });
  }

  async deliver(id: string) {
    const shipment = await this.shipmentRepository.findById(id);

    if (!shipment) {
      throw new Error('Shipment not found');
    }

    shipment.deliver();

    await this.shipmentRepository.save(shipment);

    return this.prisma.shipment.update({
      where: { id },
      data: {
        deliveredAt: new Date(),
        events: {
          create: {
            status: shipment.status,
            message: 'Shipment delivered',
          },
        },
      },
      include: {
        events: true,
        order: true,
      },
    });
  }
}
