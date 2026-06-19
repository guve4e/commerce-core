import { PaymentRepository } from '../domain/payment.repository';
import { OrderRepository } from '../../orders/domain/order.repository';

export interface CapturePaymentCommand {
  paymentId: string;
  orderId: string;
}

export class CapturePaymentApplicationService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(command: CapturePaymentCommand) {
    const payment = await this.paymentRepository.findById(command.paymentId);

    if (!payment) {
      throw new Error('Payment not found');
    }

    payment.capture();

    await this.paymentRepository.save(payment);

    const order = await this.orderRepository.findById(command.orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    order.pay();

    await this.orderRepository.save(order);

    return {
      payment,
      order,
    };
  }
}
