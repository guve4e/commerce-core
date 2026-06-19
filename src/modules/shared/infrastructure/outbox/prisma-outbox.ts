import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Outbox } from '../../application/outbox';
import { DomainEvent } from '../../domain/events/domain-event';
import { createOutboxRecord } from '../../application/outbox-record';

@Injectable()
export class PrismaOutbox implements Outbox {
  constructor(private readonly prisma: PrismaService) {}

  async store(events: DomainEvent[]): Promise<void> {
    if (events.length === 0) {
      return;
    }

    const records = events.map(createOutboxRecord);

    await this.prisma.outboxEvent.createMany({
      data: records.map((record) => ({
        id: record.id,
        eventId: record.eventId,
        eventName: record.eventName,
        aggregateId: record.aggregateId,
        payload: record.payload as Prisma.InputJsonValue,
        status: record.status,
        occurredAt: record.occurredAt,
        createdAt: record.createdAt,
        publishedAt: record.publishedAt,
        failedAt: record.failedAt,
        failureReason: record.failureReason,
      })),
      skipDuplicates: true,
    });
  }
}
