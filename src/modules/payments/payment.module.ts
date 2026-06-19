import { Module } from '@nestjs/common';
import { PaymentController } from './controllers/payment.controller';
import { PaymentService } from './services/payment.service';
import { PrismaPaymentRepository } from './infrastructure/prisma-payment.repository';
import { PAYMENT_REPOSITORY } from './payment.tokens';
import { OutboxModule } from '../shared/infrastructure/outbox/outbox.module';
import { OrderModule } from '../orders/order.module';
import { CapturePaymentApplicationService } from './application/capture-payment.application-service';
import { ORDER_REPOSITORY } from '../orders/order.tokens';
import type { PaymentRepository } from './domain/payment.repository';
import type { OrderRepository } from '../orders/domain/order.repository';

@Module({
  imports: [OutboxModule, OrderModule],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PrismaPaymentRepository,
    {
      provide: PAYMENT_REPOSITORY,
      useExisting: PrismaPaymentRepository,
    },
    {
      provide: CapturePaymentApplicationService,
      useFactory: (
        paymentRepository: PaymentRepository,
        orderRepository: OrderRepository,
      ) =>
        new CapturePaymentApplicationService(
          paymentRepository,
          orderRepository,
        ),
      inject: [PAYMENT_REPOSITORY, ORDER_REPOSITORY],
    },
  ],
  exports: [
    PaymentService,
    PAYMENT_REPOSITORY,
    CapturePaymentApplicationService,
  ],
})
export class PaymentModule {}
