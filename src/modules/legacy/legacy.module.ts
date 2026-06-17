import { Module } from '@nestjs/common';
import { LegacyVisitorController } from './controllers/legacy-visitor.controller';
import { LegacyVisitorService } from './services/legacy-visitor.service';

@Module({
  controllers: [LegacyVisitorController],
  providers: [LegacyVisitorService],
})
export class LegacyModule {}
