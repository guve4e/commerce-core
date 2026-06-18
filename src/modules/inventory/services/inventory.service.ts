import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ReceiveStockDto } from '../dto/receive-stock.dto';
import { InventoryAggregate } from '../domain/inventory.aggregate';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

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
    const item = await this.prisma.inventoryItem.findUniqueOrThrow({
      where: { variantId },
    });

    const aggregate = new InventoryAggregate(item);
    aggregate.reserve(qty);

    return this.prisma.inventoryItem.update({
      where: { variantId },
      data: {
        quantity: aggregate.quantity,
        reservedQuantity: aggregate.reservedQuantity,
      },
    });
  }

  async release(variantId: string, qty: number) {
    const item = await this.prisma.inventoryItem.findUniqueOrThrow({
      where: { variantId },
    });

    const aggregate = new InventoryAggregate(item);
    aggregate.release(qty);

    return this.prisma.inventoryItem.update({
      where: { variantId },
      data: {
        quantity: aggregate.quantity,
        reservedQuantity: aggregate.reservedQuantity,
      },
    });
  }

  async consume(variantId: string, qty: number) {
    const item = await this.prisma.inventoryItem.findUniqueOrThrow({
      where: { variantId },
    });

    const aggregate = new InventoryAggregate(item);
    aggregate.consume(qty);

    return this.prisma.inventoryItem.update({
      where: { variantId },
      data: {
        quantity: aggregate.quantity,
        reservedQuantity: aggregate.reservedQuantity,
      },
    });
  }

  async restock(variantId: string, qty: number) {
    const item = await this.prisma.inventoryItem.findUniqueOrThrow({
      where: { variantId },
    });

    const aggregate = new InventoryAggregate(item);
    aggregate.restock(qty);

    return this.prisma.inventoryItem.update({
      where: { variantId },
      data: {
        quantity: aggregate.quantity,
        reservedQuantity: aggregate.reservedQuantity,
      },
    });
  }
}
