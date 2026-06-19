import { Module } from '@nestjs/common';
import { ShipmentController } from './controllers/shipment.controller';
import { ShipmentService } from './services/shipment.service';
import { PrismaShipmentRepository } from './infrastructure/prisma-shipment.repository';
import { SHIPMENT_REPOSITORY } from './shipment.tokens';
import { OutboxModule } from '../shared/infrastructure/outbox/outbox.module';

@Module({
  imports: [OutboxModule],
  controllers: [ShipmentController],
  providers: [
    ShipmentService,
    PrismaShipmentRepository,
    {
      provide: SHIPMENT_REPOSITORY,
      useExisting: PrismaShipmentRepository,
    },
  ],
  exports: [ShipmentService, SHIPMENT_REPOSITORY],
})
export class ShipmentModule {}
