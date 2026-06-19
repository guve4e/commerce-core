import { CartRepository } from '../domain/cart.repository';

export interface AddCartItemCommand {
  cartId: string;
}

export class AddCartItemApplicationService {
  constructor(private readonly cartRepository: CartRepository) {}

  async execute(command: AddCartItemCommand) {
    const cart = await this.cartRepository.findById(command.cartId);

    if (!cart) {
      throw new Error('Cart not found');
    }

    cart.assertActive();

    return {
      cart,
    };
  }
}
