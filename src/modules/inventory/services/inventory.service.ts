import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ReceiveStockDto } from '../dto/receive-stock.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async receiveStock(dto: ReceiveStockDto) {
    return this.prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.upsert({
        where: {
          variantId: dto.variantId,
        },
        update: {
          quantity: {
            increment: dto.quantity,
          },
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
        where: {
          id: item.id,
        },
        include: {
          batches: true,
          variant: true,
        },
      });
    });
  }

  findByVariantId(variantId: string) {
    return this.prisma.inventoryItem.findUnique({
      where: {
        variantId,
      },
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

    if (item.quantity - item.reservedQuantity < qty) {
      throw new Error('Insufficient inventory');
    }

    return this.prisma.inventoryItem.update({
      where: { variantId },
      data: {
        reservedQuantity: {
          increment: qty,
        },
      },
    });
  }

  async release(variantId: string, qty: number) {
    return this.prisma.inventoryItem.update({
      where: { variantId },
      data: {
        reservedQuantity: {
          decrement: qty,
        },
      },
    });
  }

  async consume(variantId: string, qty: number) {
    return this.prisma.inventoryItem.update({
      where: { variantId },
      data: {
        quantity: {
          decrement: qty,
        },
        reservedQuantity: {
          decrement: qty,
        },
      },
    });
  }


}
