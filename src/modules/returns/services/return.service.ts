import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateReturnDto } from '../dto/create-return.dto';
import { ApproveReturnApplicationService } from '../application/approve-return.application-service';
import { RejectReturnApplicationService } from '../application/reject-return.application-service';
import { RefundReturnApplicationService } from '../application/refund-return.application-service';

@Injectable()
export class ReturnService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly approveReturnApplicationService: ApproveReturnApplicationService,
    private readonly rejectReturnApplicationService: RejectReturnApplicationService,
    private readonly refundReturnApplicationService: RefundReturnApplicationService,
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
    await this.approveReturnApplicationService.execute({
      returnId: id,
    });

    return this.findOne(id);
  }

  async reject(id: string) {
    await this.rejectReturnApplicationService.execute({
      returnId: id,
    });

    return this.findOne(id);
  }

  async refund(id: string) {
    await this.refundReturnApplicationService.execute({
      returnId: id,
    });

    return this.findOne(id);
  }
}
