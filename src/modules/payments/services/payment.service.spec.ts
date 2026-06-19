import { PaymentService } from './payment.service';
import { PaymentAggregate } from '../domain/payment.aggregate';
import { OrderAggregate } from '../../orders/domain/order.aggregate';
import { CapturePaymentApplicationService } from '../application/capture-payment.application-service';

describe('PaymentService', () => {
  it('creates payment, delegates capture use case, writes history, and returns payment', async () => {
    const createdPayment = {
      id: 'payment_1',
      orderId: 'order_1',
      status: 'pending',
      attempts: [
        {
          id: 'attempt_1',
          status: 'pending',
        },
      ],
    };

    const returnedPayment = {
      ...createdPayment,
      status: 'captured',
      attempts: [
        {
          id: 'attempt_1',
          status: 'captured',
        },
      ],
    };

    const prisma = {
      payment: {
        create: jest.fn().mockResolvedValue(createdPayment),
        findUniqueOrThrow: jest.fn().mockResolvedValue(returnedPayment),
      },
      paymentAttempt: {
        updateMany: jest.fn(),
      },
      orderStatusHistory: {
        create: jest.fn(),
      },
    };

    const paymentAggregate = new PaymentAggregate({
      id: 'payment_1',
      status: 'captured',
    });

    const orderAggregate = new OrderAggregate({
      id: 'order_1',
      orderNumber: 1001,
      status: 'processing',
    });

    const capturePaymentApplicationService = {
      execute: jest.fn().mockResolvedValue({
        payment: paymentAggregate,
        order: orderAggregate,
      }),
    } as unknown as CapturePaymentApplicationService;

    const service = new PaymentService(
      prisma as any,
      capturePaymentApplicationService,
    );

    const result = await service.create({
      orderId: 'order_1',
      provider: 'manual',
      amount: '100',
      currency: 'BGN',
    });

    expect(result).toBe(returnedPayment);

    expect(prisma.payment.create).toHaveBeenCalledWith({
      data: {
        orderId: 'order_1',
        provider: 'manual',
        amount: '100',
        currency: 'BGN',
        status: 'pending',
        attempts: {
          create: {
            provider: 'manual',
            status: 'pending',
            providerReference: expect.stringMatching(/^manual-/),
          },
        },
      },
      include: {
        attempts: true,
      },
    });

    expect(capturePaymentApplicationService.execute).toHaveBeenCalledWith({
      paymentId: 'payment_1',
      orderId: 'order_1',
    });

    expect(prisma.paymentAttempt.updateMany).toHaveBeenCalledWith({
      where: {
        paymentId: 'payment_1',
      },
      data: {
        status: 'captured',
      },
    });

    expect(prisma.orderStatusHistory.create).toHaveBeenCalledWith({
      data: {
        orderId: 'order_1',
        status: 'processing',
        note: 'Payment captured',
      },
    });

    expect(prisma.payment.findUniqueOrThrow).toHaveBeenCalledWith({
      where: {
        id: 'payment_1',
      },
      include: {
        attempts: true,
      },
    });
  });
});
