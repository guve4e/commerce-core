import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateReturnDto } from '../dto/create-return.dto';

@Injectable()
export class ReturnService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateReturnDto) {
    return this.prisma.return.create({
      data: {
        orderId: dto.orderId,
        reason: dto.reason,
        items: {
          create: dto.items,
        },
      },
      include: {
        items: true,
        order: true,
      },
    });
  }

  findAll() {
    return this.prisma.return.findMany({
      include: {
        items: true,
        order: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findOne(id: string) {
    return this.prisma.return.findUnique({
      where: {
        id,
      },
      include: {
        items: true,
        order: true,
      },
    });
  }
}
