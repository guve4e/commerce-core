import { Module } from '@nestjs/common';
import { ReturnController } from './controllers/return.controller';
import { ReturnService } from './services/return.service';
import { PrismaReturnRepository } from './infrastructure/prisma-return.repository';
import { RETURN_REPOSITORY } from './return.tokens';
import { OutboxModule } from '../shared/infrastructure/outbox/outbox.module';
import { ApproveReturnApplicationService } from './application/approve-return.application-service';
import { RejectReturnApplicationService } from './application/reject-return.application-service';
import { RefundReturnApplicationService } from './application/refund-return.application-service';
import type { ReturnRepository } from './domain/return.repository';

@Module({
  imports: [OutboxModule],
  controllers: [ReturnController],
  providers: [
    ReturnService,
    PrismaReturnRepository,
    {
      provide: RETURN_REPOSITORY,
      useExisting: PrismaReturnRepository,
    },
    {
      provide: ApproveReturnApplicationService,
      useFactory: (returnRepository: ReturnRepository) =>
        new ApproveReturnApplicationService(returnRepository),
      inject: [RETURN_REPOSITORY],
    },
    {
      provide: RejectReturnApplicationService,
      useFactory: (returnRepository: ReturnRepository) =>
        new RejectReturnApplicationService(returnRepository),
      inject: [RETURN_REPOSITORY],
    },
    {
      provide: RefundReturnApplicationService,
      useFactory: (returnRepository: ReturnRepository) =>
        new RefundReturnApplicationService(returnRepository),
      inject: [RETURN_REPOSITORY],
    },
  ],
  exports: [
    ReturnService,
    RETURN_REPOSITORY,
    ApproveReturnApplicationService,
    RejectReturnApplicationService,
    RefundReturnApplicationService,
  ],
})
export class ReturnModule {}
