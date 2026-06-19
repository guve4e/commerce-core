import { AddCartItemApplicationService } from './add-cart-item.application-service';
import { CartAggregate } from '../domain/cart.aggregate';
import { CartStatus } from '../domain/cart-status.enum';

describe('AddCartItemApplicationService', () => {
  it('allows adding item to active cart', async () => {
    const cart = new CartAggregate({
      id: 'cart_1',
      customerId: 'customer_1',
      status: CartStatus.ACTIVE,
    });

    const repository = {
      findById: jest.fn().mockResolvedValue(cart),
      findActiveByCustomerId: jest.fn(),
      save: jest.fn(),
    };

    const service = new AddCartItemApplicationService(repository);

    const result = await service.execute({
      cartId: 'cart_1',
    });

    expect(repository.findById).toHaveBeenCalledWith('cart_1');
    expect(result).toEqual({ cart });
  });

  it('rejects missing cart', async () => {
    const service = new AddCartItemApplicationService({
      findById: jest.fn().mockResolvedValue(null),
      findActiveByCustomerId: jest.fn(),
      save: jest.fn(),
    });

    await expect(
      service.execute({
        cartId: 'missing',
      }),
    ).rejects.toThrow('Cart not found');
  });

  it('rejects checked out cart', async () => {
    const cart = new CartAggregate({
      id: 'cart_1',
      customerId: 'customer_1',
      status: CartStatus.CHECKED_OUT,
    });

    const service = new AddCartItemApplicationService({
      findById: jest.fn().mockResolvedValue(cart),
      findActiveByCustomerId: jest.fn(),
      save: jest.fn(),
    });

    await expect(
      service.execute({
        cartId: 'cart_1',
      }),
    ).rejects.toThrow('Cannot modify cart with status checked_out');
  });
});
