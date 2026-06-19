import { Module } from '@nestjs/common';
import { ReturnController } from './controllers/return.controller';
import { ReturnService } from './services/return.service';
import { PrismaReturnRepository } from './infrastructure/prisma-return.repository';
import { RETURN_REPOSITORY } from './return.tokens';
import { OutboxModule } from '../shared/infrastructure/outbox/outbox.module';

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
  ],
  exports: [ReturnService, RETURN_REPOSITORY],
})
export class ReturnModule {}
