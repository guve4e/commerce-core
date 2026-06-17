import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CatalogService } from '../services/catalog.service';
import { CreateProductDto } from '../dto/create-product.dto';

@Controller('catalog/products')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Post()
  createProduct(@Body() dto: CreateProductDto) {
    return this.catalogService.createProduct(dto);
  }

  @Get()
  findAll() {
    return this.catalogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.catalogService.findOne(id);
  }
}
