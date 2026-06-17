import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { InventoryService } from '../services/inventory.service';
import { ReceiveStockDto } from '../dto/receive-stock.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('receive')
  receiveStock(@Body() dto: ReceiveStockDto) {
    return this.inventoryService.receiveStock(dto);
  }

  @Get(':variantId')
  findByVariantId(@Param('variantId') variantId: string) {
    return this.inventoryService.findByVariantId(variantId);
  }
}
