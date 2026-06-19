import { Test } from '@nestjs/testing';
import {
  EVENT_PUBLISHER,
  OUTBOX,
  OUTBOX_RECORD_STORE,
  OutboxModule,
} from './outbox.module';
import { OutboxProcessor } from '../../application/outbox-processor';

describe('OutboxModule', () => {
  it('resolves outbox providers', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [OutboxModule],
    }).compile();

    expect(moduleRef.get(OUTBOX)).toBeDefined();
    expect(moduleRef.get(OUTBOX_RECORD_STORE)).toBeDefined();
    expect(moduleRef.get(EVENT_PUBLISHER)).toBeDefined();
    expect(moduleRef.get(OutboxProcessor)).toBeDefined();

    await moduleRef.close();
  });
});
