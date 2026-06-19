import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { CustomerService } from '../services/customer.service';
import { CreateCustomerDto } from '../dto/create-customer.dto';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  create(@Body() dto: CreateCustomerDto) {
    return this.customerService.create(dto);
  }

  @Get()
  findAll() {
    return this.customerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }

  @Put(':id/block')
  block(@Param('id') id: string) {
    return this.customerService.block(id);
  }

  @Put(':id/activate')
  activate(@Param('id') id: string) {
    return this.customerService.activate(id);
  }
}
