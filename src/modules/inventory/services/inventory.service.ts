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
}
