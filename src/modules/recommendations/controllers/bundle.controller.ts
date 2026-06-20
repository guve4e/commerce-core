import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BundleService } from '../services/bundle.service';
import {
  AddBundleItemDto,
  CreateBundleDto,
} from '../dto/create-bundle.dto';

@Controller('bundles')
export class BundleController {
  constructor(
    private readonly bundleService: BundleService,
  ) {}

  @Post()
  createBundle(
    @Body() dto: CreateBundleDto,
  ) {
    return this.bundleService.createBundle(dto);
  }

  @Post(':bundleId/items')
  addItem(
    @Param('bundleId') bundleId: string,
    @Body() dto: AddBundleItemDto,
  ) {
    return this.bundleService.addBundleItem(
      bundleId,
      dto,
    );
  }

  @Get('store/:storeId')
  findStoreBundles(
    @Param('storeId') storeId: string,
  ) {
    return this.bundleService.findActiveBundles(
      storeId,
    );
  }
}
