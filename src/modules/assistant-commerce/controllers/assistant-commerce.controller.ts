import { Body, Controller, Post } from '@nestjs/common';
import { AssistantCommerceService } from '../services/assistant-commerce.service';
import { SearchProductsDto } from '../dto/search-products.dto';

@Controller('assistant-commerce')
export class AssistantCommerceController {
  constructor(
    private readonly assistantCommerceService: AssistantCommerceService,
  ) {}

  @Post('search-products')
  searchProducts(@Body() dto: SearchProductsDto) {
    return this.assistantCommerceService.searchProducts(dto);
  }
}
