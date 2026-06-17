import { Body, Controller, Post } from '@nestjs/common';
import { CheckoutService } from '../services/checkout.service';
import { CheckoutDto } from '../dto/checkout.dto';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  checkout(@Body() dto: CheckoutDto) {
    return this.checkoutService.checkout(dto);
  }
}
