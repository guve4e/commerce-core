import { Controller, Get, Param, Query } from '@nestjs/common';
import { LegacyProductService } from '../services/legacy-product.service';

@Controller('product')
export class LegacyProductController {
  constructor(private readonly legacyProductService: LegacyProductService) {}

  @Get()
  getAllProducts() {
    return this.legacyProductService.getAllByCompany('');
  }

  @Get('getAllByCompany/:company')
  getAllByCompany(@Param('company') company: string) {
    return this.legacyProductService.getAllByCompany(company);
  }

  @Get('getByGroup/:group')
  getByGroup(@Param('group') group: string) {
    return this.legacyProductService.getByGroup(group);
  }

  @Get('getByCompanyAndGroup/:company')
  getByCompanyAndGroup(
    @Param('company') company: string,
    @Query('group') group: string,
  ) {
    return this.legacyProductService.getByCompanyAndGroup(company, group);
  }

  @Get('getProductNames/:company')
  getProductNames(@Param('company') company: string) {
    return this.legacyProductService.getProductNames(company);
  }
}
