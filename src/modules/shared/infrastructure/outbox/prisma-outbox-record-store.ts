import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { OutboxRecordStore } from '../../application/outbox-processor';
import { OutboxRecord } from '../../application/outbox-record';

@Injectable()
export class PrismaOutboxRecordStore implements OutboxRecordStore {
  constructor(private readonly prisma: PrismaService) {}

  async findPending(limit: number): Promise<OutboxRecord[]> {
    const records = await this.prisma.outboxEvent.findMany({
      where: {
        status: 'pending',
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: limit,
    });

    return records.map((record) => ({
      id: record.id,
      eventId: record.eventId,
      eventName: record.eventName,
      aggregateId: record.aggregateId,
      payload: record.payload,
      status: record.status as OutboxRecord['status'],
      occurredAt: record.occurredAt,
      createdAt: record.createdAt,
      publishedAt: record.publishedAt,
      failedAt: record.failedAt,
      failureReason: record.failureReason,
    }));
  }

  async markPublished(recordId: string, publishedAt: Date): Promise<void> {
    await this.prisma.outboxEvent.update({
      where: {
        id: recordId,
      },
      data: {
        status: 'published',
        publishedAt,
        failedAt: null,
        failureReason: null,
      },
    });
  }

  async markFailed(
    recordId: string,
    failedAt: Date,
    reason: string,
  ): Promise<void> {
    await this.prisma.outboxEvent.update({
      where: {
        id: recordId,
      },
      data: {
        status: 'failed',
        failedAt,
        failureReason: reason,
      },
    });
  }
}
