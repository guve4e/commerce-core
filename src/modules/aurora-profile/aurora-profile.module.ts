import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuroraProfileController } from './controllers/aurora-profile.controller';
import { AuroraProfileService } from './services/aurora-profile.service';

@Module({
  imports: [PrismaModule],
  controllers: [AuroraProfileController],
  providers: [AuroraProfileService],
  exports: [AuroraProfileService],
})
export class AuroraProfileModule {}
