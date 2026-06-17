import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateVisitorDto } from '../dto/create-visitor.dto';

@Injectable()
export class AttributionService {
  constructor(private readonly prisma: PrismaService) {}

  createVisitor(dto: CreateVisitorDto) {
    return this.prisma.visitor.create({
      data: dto,
    });
  }

  findVisitors() {
    return this.prisma.visitor.findMany({
      include: {
        visits: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
