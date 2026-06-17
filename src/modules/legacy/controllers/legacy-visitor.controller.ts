import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { LegacyVisitorService } from '../services/legacy-visitor.service';

@Controller('visitors')
export class LegacyVisitorController {
  constructor(private readonly legacyVisitorService: LegacyVisitorService) {}

  @Post('getOrCreateVisitor/:visitorHash')
  getOrCreateVisitor(
    @Param('visitorHash') visitorHash: string,
    @Body() body: any,
  ) {
    return this.legacyVisitorService.getOrCreateVisitor(visitorHash, body);
  }

  @Get('getVisitorByHash/:visitorHash')
  getByHash(@Param('visitorHash') visitorHash: string) {
    return this.legacyVisitorService.getByHash(visitorHash);
  }

  @Get('getVisitorById/:id')
  getById(@Param('id') id: string) {
    return this.legacyVisitorService.getById(id);
  }

  @Put('addEvent/:userId')
  addEvent(@Param('userId') userId: string, @Body() body: any) {
    return this.legacyVisitorService.addEvent(userId, body);
  }
}
