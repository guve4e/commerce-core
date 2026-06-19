import { Module } from '@nestjs/common';
import { PaymentController } from './controllers/payment.controller';
import { PaymentService } from './services/payment.service';
import { PrismaPaymentRepository } from './infrastructure/prisma-payment.repository';
import { PAYMENT_REPOSITORY } from './payment.tokens';
import { OutboxModule } from '../shared/infrastructure/outbox/outbox.module';
import { OrderModule } from '../orders/order.module';

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
  ],
  exports: [PaymentService, PAYMENT_REPOSITORY],
})
export class PaymentModule {}
