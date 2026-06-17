import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateStoreDto } from '../dto/create-store.dto';

@Injectable()
export class StoreService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateStoreDto) {
    return this.prisma.store.create({
      data: dto,
    });
  }

  findAll() {
    return this.prisma.store.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findOne(id: string) {
    return this.prisma.store.findUnique({
      where: {
        id,
      },
      include: {
        StoreSettings: true,
        StoreUser: true,
      },
    });
  }
}
