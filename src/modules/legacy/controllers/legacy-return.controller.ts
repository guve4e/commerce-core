import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { LegacyReturnService } from '../services/legacy-return.service';

@Controller('return')
export class LegacyReturnController {
  constructor(private readonly legacyReturnService: LegacyReturnService) {}

  @Get()
  getAll() {
    return this.legacyReturnService.getAll();
  }

  @Get('getById/:id')
  getById(@Param('id') id: string) {
    return this.legacyReturnService.getById(id);
  }

  @Get('getByOrderNumber/:orderNumber')
  getByOrderNumber(@Param('orderNumber') orderNumber: string) {
    return this.legacyReturnService.getByOrderNumber(orderNumber);
  }

  @Post('openReturnTicket/:orderNumber')
  openReturnTicket(
    @Param('orderNumber') orderNumber: string,
    @Query('returnId') returnId: string,
    @Body() body: any,
  ) {
    return this.legacyReturnService.openReturnTicket(orderNumber, returnId, body);
  }

  @Put('changeState/:returnId')
  changeState(
    @Param('returnId') returnId: string,
    @Query('state') state: string,
    @Query('note') note: string,
  ) {
    return this.legacyReturnService.changeState(returnId, state, note);
  }
}
