import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateOrderDto } from '../dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateOrderDto) {
    return this.prisma.order.create({
      data: {
        storeId: dto.storeId,
        customerId: dto.customerId,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2,
        city: dto.city,
        state: dto.state,
        postalCode: dto.postalCode,
        country: dto.country,
        status: 'new',
        subtotal: dto.subtotal,
        shipping: dto.shipping,
        tax: dto.tax,
        total: dto.total,
        items: {
          create: dto.items.map((item) => ({
            variantId: item.variantId,
            sku: item.sku,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        },
        statusHistory: {
          create: {
            status: 'new',
            note: 'Order created',
          },
        },
      },
      include: {
        items: true,
        statusHistory: true,
      },
    });
  }

  findAll() {
    return this.prisma.order.findMany({
      include: {
        items: true,
        statusHistory: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findOne(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        statusHistory: true,
        payments: true,
        Shipment: true,
        Return: true,
      },
    });
  }
}
