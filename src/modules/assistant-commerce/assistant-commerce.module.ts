import { Module } from '@nestjs/common';
import { AssistantCommerceController } from './controllers/assistant-commerce.controller';
import { AssistantCommerceService } from './services/assistant-commerce.service';

@Module({
  controllers: [AssistantCommerceController],
  providers: [AssistantCommerceService],
  exports: [AssistantCommerceService],
})
export class AssistantCommerceModule {}
