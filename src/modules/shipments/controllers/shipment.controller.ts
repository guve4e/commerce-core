import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ShipmentService } from '../services/shipment.service';
import { CreateShipmentDto } from '../dto/create-shipment.dto';


@Controller('shipments')
export class ShipmentController {
  constructor(private readonly shipmentService: ShipmentService) {}

  @Post()
  create(@Body() dto: CreateShipmentDto) {
    return this.shipmentService.create(dto);
  }

  @Get()
  findAll() {
    return this.shipmentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shipmentService.findOne(id);
  }

  @Put(':id/ship')
  ship(@Param('id') id: string) {
    return this.shipmentService.ship(id);
  }

  @Put(':id/deliver')
  deliver(@Param('id') id: string) {
    return this.shipmentService.deliver(id);
  }
}
