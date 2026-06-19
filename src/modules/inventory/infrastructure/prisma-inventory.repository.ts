import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import type { Outbox } from '../../shared/application/outbox';
import { OUTBOX } from '../../shared/infrastructure/outbox/outbox.module';
import { Inject } from '@nestjs/common';
import { InventoryAggregate } from '../domain/inventory.aggregate';
import { InventoryRepository } from '../domain/inventory.repository';

@Injectable()
export class PrismaInventoryRepository implements InventoryRepository {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(OUTBOX)
    private readonly outbox: Outbox,
  ) {}

  async findById(id: string): Promise<InventoryAggregate | null> {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id },
    });

    return item ? this.toAggregate(item) : null;
  }

  async findByVariantId(variantId: string): Promise<InventoryAggregate | null> {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { variantId },
    });

    return item ? this.toAggregate(item) : null;
  }

  async save(aggregate: InventoryAggregate): Promise<void> {
    const snapshot = aggregate.snapshot();

    await this.prisma.inventoryItem.update({
      where: { id: snapshot.id },
      data: {
        quantity: snapshot.quantity,
        reservedQuantity: snapshot.reservedQuantity,
      },
    });

    await this.outbox.store(aggregate.pullDomainEvents());
  }

  private toAggregate(item: {
    id: string;
    quantity: number;
    reservedQuantity: number;
  }) {
    return new InventoryAggregate({
      id: item.id,
      quantity: item.quantity,
      reservedQuantity: item.reservedQuantity,
    });
  }
}
