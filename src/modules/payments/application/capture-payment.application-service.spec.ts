import { CapturePaymentApplicationService } from './capture-payment.application-service';
import { PaymentAggregate } from '../domain/payment.aggregate';
import { OrderAggregate } from '../../orders/domain/order.aggregate';

describe('CapturePaymentApplicationService', () => {
  it('captures payment and marks order paid', async () => {
    const payment = new PaymentAggregate({
      id: 'payment_1',
      status: 'pending',
    });

    const order = new OrderAggregate({
      id: 'order_1',
      orderNumber: 1001,
      status: 'created',
    });

    const paymentRepository = {
      findById: jest.fn().mockResolvedValue(payment),
      save: jest.fn(),
    };

    const orderRepository = {
      findById: jest.fn().mockResolvedValue(order),
      findByOrderNumber: jest.fn(),
      save: jest.fn(),
    };

    const service = new CapturePaymentApplicationService(
      paymentRepository,
      orderRepository,
    );

    const result = await service.execute({
      paymentId: 'payment_1',
      orderId: 'order_1',
    });

    expect(result).toEqual({
      payment,
      order,
    });

    expect(payment.status).toBe('captured');
    expect(order.status).toBe('processing');

    expect(paymentRepository.save).toHaveBeenCalledWith(payment);
    expect(orderRepository.save).toHaveBeenCalledWith(order);
  });

  it('throws when payment is missing', async () => {
    const service = new CapturePaymentApplicationService(
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
      service.execute({
        paymentId: 'missing',
        orderId: 'order_1',
      }),
    ).rejects.toThrow('Payment not found');
  });

  it('throws when order is missing', async () => {
    const payment = new PaymentAggregate({
      id: 'payment_1',
      status: 'pending',
    });

    const service = new CapturePaymentApplicationService(
      {
        findById: jest.fn().mockResolvedValue(payment),
        save: jest.fn(),
      },
      {
        findById: jest.fn().mockResolvedValue(null),
        findByOrderNumber: jest.fn(),
        save: jest.fn(),
      },
    );

    await expect(
      service.execute({
        paymentId: 'payment_1',
        orderId: 'missing',
      }),
    ).rejects.toThrow('Order not found');
  });
});
