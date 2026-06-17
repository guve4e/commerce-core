import { Body, Controller, Get, Post } from '@nestjs/common';
import { AttributionService } from '../services/attribution.service';
import { CreateVisitorDto } from '../dto/create-visitor.dto';

@Controller('attribution')
export class AttributionController {
  constructor(private readonly attributionService: AttributionService) {}

  @Post('visitors')
  createVisitor(@Body() dto: CreateVisitorDto) {
    return this.attributionService.createVisitor(dto);
  }

  @Get('visitors')
  findVisitors() {
    return this.attributionService.findVisitors();
  }
}
