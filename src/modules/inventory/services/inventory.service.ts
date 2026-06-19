import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ReceiveStockDto } from '../dto/receive-stock.dto';
import type { InventoryRepository } from '../domain/inventory.repository';
import { INVENTORY_REPOSITORY } from '../inventory.tokens';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: InventoryRepository,
  ) {}

  async receiveStock(dto: ReceiveStockDto) {
    return this.prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.upsert({
        where: { variantId: dto.variantId },
        update: {
          quantity: { increment: dto.quantity },
        },
        create: {
          variantId: dto.variantId,
          quantity: dto.quantity,
          reservedQuantity: 0,
        },
      });

      await tx.inventoryBatch.create({
        data: {
          inventoryItemId: item.id,
          quantity: dto.quantity,
        },
      });

      return tx.inventoryItem.findUnique({
        where: { id: item.id },
        include: {
          batches: true,
          variant: true,
        },
      });
    });
  }

  findByVariantId(variantId: string) {
    return this.prisma.inventoryItem.findUnique({
      where: { variantId },
      include: {
        batches: true,
        variant: true,
      },
    });
  }

  async reserve(variantId: string, qty: number) {
    const aggregate = await this.inventoryRepository.findByVariantId(variantId);

    if (!aggregate) {
      throw new Error('Inventory item not found');
    }

    aggregate.reserve(qty);

    await this.inventoryRepository.save(aggregate);

    return aggregate.snapshot();
  }

  async release(variantId: string, qty: number) {
    const aggregate = await this.inventoryRepository.findByVariantId(variantId);

    if (!aggregate) {
      throw new Error('Inventory item not found');
    }

    aggregate.release(qty);

    await this.inventoryRepository.save(aggregate);

    return aggregate.snapshot();
  }

  async consume(variantId: string, qty: number) {
    const aggregate = await this.inventoryRepository.findByVariantId(variantId);

    if (!aggregate) {
      throw new Error('Inventory item not found');
    }

    aggregate.consume(qty);

    await this.inventoryRepository.save(aggregate);

    return aggregate.snapshot();
  }

  async restock(variantId: string, qty: number) {
    const aggregate = await this.inventoryRepository.findByVariantId(variantId);

    if (!aggregate) {
      throw new Error('Inventory item not found');
    }

    aggregate.restock(qty);

    await this.inventoryRepository.save(aggregate);

    return aggregate.snapshot();
  }
}
