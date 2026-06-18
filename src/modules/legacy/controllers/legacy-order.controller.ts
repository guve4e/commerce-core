import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { LegacyOrderService } from '../services/legacy-order.service';

@Controller('order')
export class LegacyOrderController {
  constructor(private readonly legacyOrderService: LegacyOrderService) {}

  @Post('user/:userId')
  createFromCart(
    @Param('userId') userId: string,
    @Query('company') company: string,
    @Body() body: any,
  ) {
    return this.legacyOrderService.createFromCart(userId, company, body);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.legacyOrderService.getById(id);
  }

  @Get('orderNumber/:orderNumber')
  getByOrderNumber(@Param('orderNumber') orderNumber: string) {
    return this.legacyOrderService.getByOrderNumber(orderNumber);
  }

  @Get('orderNumber/:orderNumber/zipCode')
  getByOrderNumberAndZip(
    @Param('orderNumber') orderNumber: string,
    @Query('zip_code') zipCode: string,
  ) {
    return this.legacyOrderService.getByOrderNumberAndZip(orderNumber, zipCode);
  }

  @Put('changeOrderStatusShipped/:orderId')
  shipped(@Param('orderId') orderId: string, @Body() body: any) {
    return this.legacyOrderService.ship(orderId, body?.note ?? '');
  }

  @Put('changeOrderStatusDelivered/:orderId')
  delivered(@Param('orderId') orderId: string, @Body() body: any) {
    return this.legacyOrderService.deliver(orderId, body?.note ?? '');
  }

  @Put('changeOrderStatus/:orderId')
  changeStatus(
    @Param('orderId') orderId: string,
    @Query('status') status: string,
    @Body() note: any,
  ) {
    return this.legacyOrderService.changeStatus(orderId, status, String(note ?? ''));
  }
}
