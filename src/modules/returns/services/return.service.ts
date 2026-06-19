import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateReturnDto } from '../dto/create-return.dto';
import type { ReturnRepository } from '../domain/return.repository';
import { RETURN_REPOSITORY } from '../return.tokens';

@Injectable()
export class ReturnService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(RETURN_REPOSITORY)
    private readonly returnRepository: ReturnRepository,
  ) {}

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

  async approve(id: string) {
    const ticket = await this.returnRepository.findById(id);

    if (!ticket) {
      throw new Error('Return not found');
    }

    ticket.approve();

    await this.returnRepository.save(ticket);

    return this.findOne(id);
  }

  async reject(id: string) {
    const ticket = await this.returnRepository.findById(id);

    if (!ticket) {
      throw new Error('Return not found');
    }

    ticket.reject();

    await this.returnRepository.save(ticket);

    return this.findOne(id);
  }

  async refund(id: string) {
    const ticket = await this.returnRepository.findById(id);

    if (!ticket) {
      throw new Error('Return not found');
    }

    ticket.refund();

    await this.returnRepository.save(ticket);

    return this.findOne(id);
  }
}
