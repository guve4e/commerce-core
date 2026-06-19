import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ReturnService } from '../services/return.service';
import { CreateReturnDto } from '../dto/create-return.dto';

@Controller('returns')
export class ReturnController {
  constructor(private readonly returnService: ReturnService) {}

  @Post()
  create(@Body() dto: CreateReturnDto) {
    return this.returnService.create(dto);
  }

  @Get()
  findAll() {
    return this.returnService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.returnService.findOne(id);
  }

  @Put(':id/approve')
  approve(@Param('id') id: string) {
    return this.returnService.approve(id);
  }

  @Put(':id/reject')
  reject(@Param('id') id: string) {
    return this.returnService.reject(id);
  }

  @Put(':id/refund')
  refund(@Param('id') id: string) {
    return this.returnService.refund(id);
  }
}
