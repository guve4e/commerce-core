import { Module } from '@nestjs/common';
import { CartController } from './controllers/cart.controller';
import { CartService } from './services/cart.service';
import { PrismaCartRepository } from './infrastructure/prisma-cart.repository';
import { CART_REPOSITORY } from './cart.tokens';

@Module({
  controllers: [CartController],
  providers: [
    CartService,
    PrismaCartRepository,
    {
      provide: CART_REPOSITORY,
      useExisting: PrismaCartRepository,
    },
  ],
  exports: [CartService, CART_REPOSITORY],
})
export class CartModule {}
