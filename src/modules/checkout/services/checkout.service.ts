import { Injectable } from '@nestjs/common';
import { CheckoutDto } from '../dto/checkout.dto';
import { OrderApplicationService } from '../../orders/application/order-application.service';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly orderApplicationService: OrderApplicationService,
  ) {}

  async checkout(dto: CheckoutDto) {
    return this.orderApplicationService.createOrder({
      ...dto,
      statusNote: 'Checkout created order',
    });
  }
}
