import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CartService } from '../services/cart.service';
import { AddCartItemDto } from '../dto/add-cart-item.dto';

@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get(':customerId')
  getCart(@Param('customerId') customerId: string) {
    return this.cartService.getOrCreate(customerId);
  }

  @Post('items')
  addItem(@Body() dto: AddCartItemDto) {
    return this.cartService.addItem(dto);
  }
}
