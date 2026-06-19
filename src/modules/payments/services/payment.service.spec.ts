import { PaymentService } from './payment.service';
import { PaymentAggregate } from '../domain/payment.aggregate';
import { OrderAggregate } from '../../orders/domain/order.aggregate';

describe('PaymentService', () => {
  it('creates payment, captures it, marks order paid, writes history, and returns payment', async () => {
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
      status: 'pending',
    });

    const orderAggregate = new OrderAggregate({
      id: 'order_1',
      orderNumber: 1001,
      status: 'created',
    });

    const paymentRepository = {
      findById: jest.fn().mockResolvedValue(paymentAggregate),
      save: jest.fn(),
    };

    const orderRepository = {
      findById: jest.fn().mockResolvedValue(orderAggregate),
      findByOrderNumber: jest.fn(),
      save: jest.fn(),
    };

    const service = new PaymentService(
      prisma as any,
      paymentRepository,
      orderRepository,
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

    expect(paymentRepository.findById).toHaveBeenCalledWith('payment_1');
    expect(paymentRepository.save).toHaveBeenCalledWith(paymentAggregate);
    expect(paymentAggregate.status).toBe('captured');

    expect(prisma.paymentAttempt.updateMany).toHaveBeenCalledWith({
      where: {
        paymentId: 'payment_1',
      },
      data: {
        status: 'captured',
      },
    });

    expect(orderRepository.findById).toHaveBeenCalledWith('order_1');
    expect(orderRepository.save).toHaveBeenCalledWith(orderAggregate);
    expect(orderAggregate.status).toBe('processing');

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

  it('throws when created payment cannot be loaded as aggregate', async () => {
    const prisma = makeMinimalPrisma();
    const service = new PaymentService(
      prisma as any,
      {
        findById: jest.fn().mockResolvedValue(null),
        save: jest.fn(),
      },
      {
        findById: jest.fn(),
        findByOrderNumber: jest.fn(),
        save: jest.fn(),
      },
    );

    await expect(
      service.create({
        orderId: 'order_1',
        provider: 'manual',
        amount: '100',
        currency: 'BGN',
      }),
    ).rejects.toThrow('Payment not found');
  });

  it('throws when order cannot be loaded as aggregate', async () => {
    const prisma = makeMinimalPrisma();

    const service = new PaymentService(
      prisma as any,
      {
        findById: jest.fn().mockResolvedValue(
          new PaymentAggregate({
            id: 'payment_1',
            status: 'pending',
          }),
        ),
        save: jest.fn(),
      },
      {
        findById: jest.fn().mockResolvedValue(null),
        findByOrderNumber: jest.fn(),
        save: jest.fn(),
      },
    );

    await expect(
      service.create({
        orderId: 'order_1',
        provider: 'manual',
        amount: '100',
        currency: 'BGN',
      }),
    ).rejects.toThrow('Order not found');
  });
});

function makeMinimalPrisma() {
  return {
    payment: {
      create: jest.fn().mockResolvedValue({
        id: 'payment_1',
      }),
      findUniqueOrThrow: jest.fn(),
    },
    paymentAttempt: {
      updateMany: jest.fn(),
    },
    orderStatusHistory: {
      create: jest.fn(),
    },
  };
}
