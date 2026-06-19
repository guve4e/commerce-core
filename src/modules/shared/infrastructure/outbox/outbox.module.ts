import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../prisma/prisma.module';
import { PrismaOutbox } from './prisma-outbox';
import { PrismaOutboxRecordStore } from './prisma-outbox-record-store';
import { ConsoleEventPublisher } from '../events/console-event-publisher';
import { OutboxProcessor } from '../../application/outbox-processor';

export const OUTBOX = Symbol('OUTBOX');
export const OUTBOX_RECORD_STORE = Symbol('OUTBOX_RECORD_STORE');
export const EVENT_PUBLISHER = Symbol('EVENT_PUBLISHER');

@Module({
  imports: [PrismaModule],
  providers: [
    PrismaOutbox,
    PrismaOutboxRecordStore,
    ConsoleEventPublisher,
    {
      provide: OUTBOX,
      useExisting: PrismaOutbox,
    },
    {
      provide: OUTBOX_RECORD_STORE,
      useExisting: PrismaOutboxRecordStore,
    },
    {
      provide: EVENT_PUBLISHER,
      useExisting: ConsoleEventPublisher,
    },
    {
      provide: OutboxProcessor,
      useFactory: (
        outboxRecordStore: PrismaOutboxRecordStore,
        eventPublisher: ConsoleEventPublisher,
      ) => new OutboxProcessor(outboxRecordStore, eventPublisher),
      inject: [OUTBOX_RECORD_STORE, EVENT_PUBLISHER],
    },
  ],
  exports: [
    OUTBOX,
    OUTBOX_RECORD_STORE,
    EVENT_PUBLISHER,
    OutboxProcessor,
  ],
})
export class OutboxModule {}
