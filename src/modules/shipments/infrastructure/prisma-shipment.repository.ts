import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import type { Outbox } from '../../shared/application/outbox';
import { OUTBOX } from '../../shared/infrastructure/outbox/outbox.module';
import { ShipmentAggregate } from '../domain/shipment.aggregate';
import { ShipmentRepository } from '../domain/shipment.repository';

@Injectable()
export class PrismaShipmentRepository implements ShipmentRepository {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(OUTBOX)
    private readonly outbox: Outbox,
  ) {}

  async findById(id: string): Promise<ShipmentAggregate | null> {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id },
    });

    return shipment ? this.toAggregate(shipment) : null;
  }

  async save(aggregate: ShipmentAggregate): Promise<void> {
    const snapshot = aggregate.snapshot();

    if (!snapshot.id) {
      throw new Error('Shipment id is required to save');
    }

    await this.prisma.shipment.update({
      where: { id: snapshot.id },
      data: {
        status: snapshot.status,
      },
    });

    await this.outbox.store(aggregate.pullDomainEvents());
  }

  private toAggregate(shipment: {
    id: string;
    status: string;
  }) {
    return new ShipmentAggregate({
      id: shipment.id,
      status: shipment.status,
    });
  }
}
