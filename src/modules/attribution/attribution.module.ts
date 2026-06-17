import { Module } from '@nestjs/common';
import { AttributionController } from './controllers/attribution.controller';
import { AttributionService } from './services/attribution.service';

@Module({
  controllers: [AttributionController],
  providers: [AttributionService],
  exports: [AttributionService],
})
export class AttributionModule {}
