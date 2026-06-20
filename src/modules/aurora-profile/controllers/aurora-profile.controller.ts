import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AddProfileConcernDto } from '../dto/add-profile-concern.dto';
import { AddProfileSensitivityDto } from '../dto/add-profile-sensitivity.dto';
import { AddProfileSkinTypeDto } from '../dto/add-profile-skin-type.dto';
import { UpsertCustomerProfileDto } from '../dto/upsert-customer-profile.dto';
import { AuroraProfileService } from '../services/aurora-profile.service';

@Controller('aurora/profiles')
export class AuroraProfileController {
  constructor(private readonly auroraProfileService: AuroraProfileService) {}

  @Post()
  upsertProfile(@Body() dto: UpsertCustomerProfileDto) {
    return this.auroraProfileService.upsertProfile(dto);
  }

  @Get('customer/:customerId')
  getProfile(@Param('customerId') customerId: string) {
    return this.auroraProfileService.getProfile(customerId);
  }

  @Post(':profileId/skin-types')
  addSkinType(
    @Param('profileId') profileId: string,
    @Body() dto: AddProfileSkinTypeDto,
  ) {
    return this.auroraProfileService.addSkinType(profileId, dto);
  }

  @Post(':profileId/concerns')
  addConcern(
    @Param('profileId') profileId: string,
    @Body() dto: AddProfileConcernDto,
  ) {
    return this.auroraProfileService.addConcern(profileId, dto);
  }

  @Post(':profileId/sensitivities')
  addSensitivity(
    @Param('profileId') profileId: string,
    @Body() dto: AddProfileSensitivityDto,
  ) {
    return this.auroraProfileService.addSensitivity(profileId, dto);
  }
}
