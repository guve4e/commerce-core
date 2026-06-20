import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AddProfileConcernDto } from '../dto/add-profile-concern.dto';
import { AddProfileSensitivityDto } from '../dto/add-profile-sensitivity.dto';
import { AddProfileSkinTypeDto } from '../dto/add-profile-skin-type.dto';
import { UpsertCustomerProfileDto } from '../dto/upsert-customer-profile.dto';

@Injectable()
export class AuroraProfileService {
  constructor(private readonly prisma: PrismaService) {}

  upsertProfile(dto: UpsertCustomerProfileDto) {
    return this.prisma.customerProfile.upsert({
      where: {
        customerId: dto.customerId,
      },
      create: {
        customerId: dto.customerId,
        ageRange: dto.ageRange,
        notes: dto.notes,
      },
      update: {
        ageRange: dto.ageRange,
        notes: dto.notes,
      },
    });
  }

  getProfile(customerId: string) {
    return this.prisma.customerProfile.findUnique({
      where: {
        customerId,
      },
      include: {
        skinTypes: {
          include: {
            skinType: true,
          },
        },
        skinConcerns: {
          include: {
            concern: true,
          },
        },
        sensitivities: {
          include: {
            ingredient: true,
          },
        },
      },
    });
  }

  addSkinType(profileId: string, dto: AddProfileSkinTypeDto) {
    return this.prisma.customerProfileSkinType.upsert({
      where: {
        profileId_skinTypeId: {
          profileId,
          skinTypeId: dto.skinTypeId,
        },
      },
      create: {
        profileId,
        skinTypeId: dto.skinTypeId,
        strength: dto.strength ?? 1,
      },
      update: {
        strength: dto.strength ?? 1,
      },
    });
  }

  addConcern(profileId: string, dto: AddProfileConcernDto) {
    return this.prisma.customerProfileConcern.upsert({
      where: {
        profileId_concernId: {
          profileId,
          concernId: dto.concernId,
        },
      },
      create: {
        profileId,
        concernId: dto.concernId,
        severity: dto.severity ?? 1,
      },
      update: {
        severity: dto.severity ?? 1,
      },
    });
  }

  addSensitivity(profileId: string, dto: AddProfileSensitivityDto) {
    return this.prisma.customerProfileSensitivity.upsert({
      where: {
        profileId_ingredientId: {
          profileId,
          ingredientId: dto.ingredientId,
        },
      },
      create: {
        profileId,
        ingredientId: dto.ingredientId,
        severity: dto.severity ?? 'medium',
        note: dto.note,
      },
      update: {
        severity: dto.severity ?? 'medium',
        note: dto.note,
      },
    });
  }
}
