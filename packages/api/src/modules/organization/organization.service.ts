import { ORPCError } from '@orpc/client';
import prisma from '@yayago-app/db';
import {
  type GetOnboardingDataOutputType,
  type GetOrganizationOutputType,
  type CompleteOnboardingInputType,
  type CompleteOnboardingOutputType,
  type ListOrganizationInputType,
  type ListOrganizationOutputType,
  type FindOneOrganizationInputType,
  type FindOneOrganizationOutputType,
  type UpdateOrganizationStatusInputType,
  type UpdateOrganizationStatusOutputType,
  type GetPendingOrganizationsCountOutputType,
  type SaveOnboardingProgressInputType,
  type SaveOnboardingProgressOutputType,
  type GetMyOrganizationOutputType,
  type UpdateOrgBasicInfoInputType,
  type UpdateOrgBasicInfoOutputType,
  type UpdateOrgContactInfoInputType,
  type UpdateOrgContactInfoOutputType,
  type UpdateOrgLocationInputType,
  type UpdateOrgLocationOutputType,
  type UpdateOrgSocialMediaInputType,
  type UpdateOrgSocialMediaOutputType,
  type UpdateOrgBusinessHoursInputType,
  type UpdateOrgBusinessHoursOutputType,
  type UpdateOrgPoliciesInputType,
  type UpdateOrgPoliciesOutputType,
  type UpdateOrgBrandingInputType,
  type UpdateOrgBrandingOutputType,
} from '@yayago-app/validators';
import { getPagination, paginate, getLocalizedValue } from '../__shared__/utils';
import { OrganizationNotifications } from '../notification/notification.helpers';

export class OrganizationService {
  // ============ ADMIN METHODS ============

  static async list(input: ListOrganizationInputType, locale: string): Promise<ListOrganizationOutputType> {
    const { page, take, q, status } = input;

    const where = {
      deletedAt: null,
      ...(q && {
        OR: [
          { name: { contains: q, mode: 'insensitive' as const } },
          { slug: { contains: q, mode: 'insensitive' as const } },
          { email: { contains: q, mode: 'insensitive' as const } },
          { legalName: { contains: q, mode: 'insensitive' as const } },
        ],
      }),
      ...(status && { status }),
    };

    const [data, total] = await prisma.$transaction([
      prisma.organization.findMany({
        where,
        ...getPagination({ page, take }),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          createdAt: true,
          phoneNumber: true,
          email: true,
          status: true,
          legalName: true,
          city: {
            select: {
              name: true,
              code: true,
              country: {
                select: {
                  name: true,
                  code: true,
                },
              },
            },
          },
          _count: {
            select: {
              members: true,
              listings: true,
            },
          },
        },
      }),
      prisma.organization.count({ where }),
    ]);

    const items = data.map((item) => ({
      ...item,
      city: item.city
        ? {
            name: getLocalizedValue(item.city.name, locale),
            code: item.city.code,
            country: {
              name: getLocalizedValue(item.city.country.name, locale),
              code: item.city.country.code,
            },
          }
        : null,
    }));

    return paginate(items, page, take, total);
  }

  static async findOne(input: FindOneOrganizationInputType, locale: string): Promise<FindOneOrganizationOutputType> {
    const { slug } = input;

    const organization = await prisma.organization.findUnique({
      where: { slug, deletedAt: null },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        cover: true,
        description: true,
        legalName: true,
        taxId: true,
        email: true,
        phoneNumber: true,
        phoneNumberVerified: true,
        website: true,
        address: true,
        lat: true,
        lng: true,
        status: true,
        onboardingStep: true,
        rejectionReason: true,
        banReason: true,
        createdAt: true,
        updatedAt: true,
        city: {
          select: {
            name: true,
            code: true,
            country: {
              select: {
                name: true,
                code: true,
                flag: true,
              },
            },
          },
        },
        members: {
          select: {
            id: true,
            role: true,
            createdAt: true,
            user: {
              select: {
                name: true,
                username: true,
                email: true,
                image: true,
              },
            },
          },
        },
        documents: {
          select: {
            id: true,
            documentNumber: true,
            expiresAt: true,
            status: true,
            rejectionReason: true,
            createdAt: true,
            files: {
              select: {
                id: true,
                url: true,
                format: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            listings: true,
            subscriptions: true,
          },
        },
      },
    });

    if (!organization) {
      throw new ORPCError('NOT_FOUND', { message: 'Organization not found' });
    }

    return {
      ...organization,
      city: organization.city
        ? {
            name: getLocalizedValue(organization.city.name, locale),
            code: organization.city.code,
            country: {
              name: getLocalizedValue(organization.city.country.name, locale),
              code: organization.city.country.code,
              flag: organization.city.country.flag,
            },
          }
        : null,
    };
  }

  static async updateStatus(input: UpdateOrganizationStatusInputType): Promise<UpdateOrganizationStatusOutputType> {
    const { slug, status, reason } = input;

    const organization = await prisma.organization.findUnique({
      where: { slug, deletedAt: null },
      select: { id: true, status: true },
    });

    if (!organization) {
      throw new ORPCError('NOT_FOUND', { message: 'Organization not found' });
    }

    // Determine which reason field to update
    const updateData: Record<string, unknown> = { status };

    if (status === 'REJECTED') {
      updateData.rejectionReason = reason || null;
    } else if (status === 'SUSPENDED') {
      updateData.banReason = reason || null;
    } else if (status === 'ACTIVE') {
      // Clear reasons when approving
      updateData.rejectionReason = null;
      updateData.banReason = null;
    }

    const updated = await prisma.organization.update({
      where: { slug },
      data: updateData,
      select: {
        slug: true,
        status: true,
        rejectionReason: true,
        banReason: true,
      },
    });

    // Notify organization owner about status change
    if (['ACTIVE', 'REJECTED', 'SUSPENDED'].includes(status)) {
      await OrganizationNotifications.statusChanged({
        organizationId: organization.id,
        newStatus: status,
        reason,
      }).catch((err) => console.error('Failed to send organization status notification:', err));
    }

    return updated;
  }

  static async getPendingCount(): Promise<GetPendingOrganizationsCountOutputType> {
    const count = await prisma.organization.count({
      where: {
        status: 'PENDING',
        deletedAt: null,
      },
    });

    return { count };
  }

  // ============ USER/PARTNER METHODS ============

  static async saveOnboardingProgress(
    userId: string,
    input: SaveOnboardingProgressInputType
  ): Promise<SaveOnboardingProgressOutputType> {
    // Get member and organization
    const member = await prisma.member.findFirst({
      where: { userId },
    });

    if (!member) {
      throw new ORPCError('UNAUTHORIZED');
    }

    const organization = await prisma.organization.findFirst({
      where: { id: member.organizationId },
    });

    if (!organization) {
      throw new ORPCError('NOT_FOUND', { message: 'Organization not found' });
    }

    // Only owners can save onboarding progress
    if (member.role !== 'owner') {
      throw new ORPCError('FORBIDDEN', { message: 'Only owners can update onboarding' });
    }

    // Check if organization is in correct state
    if (organization.status !== 'ONBOARDING' && organization.status !== 'IDLE' && organization.status !== 'REJECTED') {
      throw new ORPCError('FORBIDDEN', { message: 'Organization is not in onboarding state' });
    }

    // Build update data based on provided fields
    const updateData: Record<string, unknown> = {
      status: 'ONBOARDING',
      onboardingStep: Math.max(organization.onboardingStep, input.step),
    };

    // Step 1 fields
    if (input.name !== undefined) updateData.name = input.name;
    if (input.slug !== undefined) updateData.slug = input.slug;
    if (input.legalName !== undefined) updateData.legalName = input.legalName;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.logo !== undefined) updateData.logo = input.logo;

    // Step 2 - City
    if (input.cityCode) {
      const city = await prisma.city.findFirst({
        where: { code: input.cityCode },
        select: { id: true, lat: true, lng: true },
      });
      if (city) {
        updateData.cityId = city.id;
        updateData.lat = city.lat;
        updateData.lng = city.lng;
      }
    }

    // Step 3 fields
    if (input.email !== undefined) updateData.email = input.email;
    if (input.phoneNumber !== undefined) updateData.phoneNumber = input.phoneNumber;
    if (input.website !== undefined) updateData.website = input.website || null;
    if (input.address !== undefined) updateData.address = input.address;
    // Pinpointed location (overrides city lat/lng if provided)
    if (input.lat !== undefined) updateData.lat = input.lat;
    if (input.lng !== undefined) updateData.lng = input.lng;

    // Step 4 fields
    if (input.taxId !== undefined) updateData.taxId = input.taxId;

    const updated = await prisma.organization.update({
      where: { id: organization.id },
      data: updateData,
      select: { onboardingStep: true },
    });

    return {
      success: true,
      onboardingStep: updated.onboardingStep,
    };
  }

  static async getOnboardingData(userId: string, locale: string): Promise<GetOnboardingDataOutputType> {
    const member = await prisma.member.findFirst({
      where: { userId },
    });

    if (!member) {
      throw new ORPCError('UNAUTHORIZED');
    }

    const organization = await prisma.organization.findFirst({
      where: { id: member.organizationId },
      include: {
        city: {
          select: {
            code: true,
            name: true,
            lat: true,
            lng: true,
            googleMapsPlaceId: true,
            country: {
              select: {
                code: true,
                name: true,
                requiredDocuments: {
                  select: {
                    isRequired: true,
                    label: true,
                    description: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!organization) {
      await prisma.member.delete({
        where: { id: member.id },
      });

      throw new ORPCError('UNAUTHORIZED');
    }

    // Allow IDLE, ONBOARDING, and REJECTED status
    if (organization.status !== 'IDLE' && organization.status !== 'ONBOARDING' && organization.status !== 'REJECTED') {
      throw new ORPCError('FORBIDDEN');
    }

    // check if member is owner
    if (member.role !== 'owner') {
      throw new ORPCError('FORBIDDEN');
    }

    // if successfully gets the onboarding data and status is IDLE, update the status to ONBOARDING
    if (organization.status === 'IDLE') {
      await prisma.organization.update({
        where: { id: organization.id },
        data: { status: 'ONBOARDING' },
      });
    }

    return {
      id: organization.id,
      createdAt: organization.createdAt,
      email: organization.email,
      name: organization.name,
      status: organization.status,
      address: organization.address,
      description: organization.description,
      slug: organization.slug,
      logo: organization.logo,
      phoneNumber: organization.phoneNumber,
      lat: organization.lat,
      lng: organization.lng,
      cover: organization.cover,
      legalName: organization.legalName,
      taxId: organization.taxId,
      website: organization.website,
      cityId: organization.cityId,
      onboardingStep: organization.onboardingStep,
      rejectionReason: organization.rejectionReason,
      city: organization.city
        ? {
            code: organization.city.code,
            name: getLocalizedValue(organization.city.name, locale),
            lat: organization.city.lat,
            lng: organization.city.lng,
            googleMapsPlaceId: organization.city.googleMapsPlaceId,
            country: {
              code: organization.city.country.code,
              name: getLocalizedValue(organization.city.country.name, locale),
              requiredDocuments: organization.city.country.requiredDocuments.map((doc) => ({
                isRequired: doc.isRequired,
                label: getLocalizedValue(doc.label, locale),
                description: getLocalizedValue(doc.description, locale),
              })),
            },
          }
        : null,
    };
  }

  static async getOrganization(userId: string): Promise<GetOrganizationOutputType> {
    const member = await prisma.member.findFirst({
      where: { userId },
    });

    if (!member) {
      throw new ORPCError('UNAUTHORIZED');
    }

    const organization = await prisma.organization.findFirst({
      where: { id: member.organizationId },
      omit: {
        banReason: true,
        rejectionReason: true,
        id: true,
        deletedAt: true,
        phoneNumberVerified: true,
        updatedAt: true,
        metadata: true,
        onboardingStep: true,
      },
    });

    if (!organization) {
      await prisma.member.delete({
        where: { id: member.id },
      });

      throw new ORPCError('UNAUTHORIZED');
    }

    return {
      ...organization,
      member,
    };
  }

  static async completeOnboarding(
    userId: string,
    input: CompleteOnboardingInputType
  ): Promise<CompleteOnboardingOutputType> {
    // Get member and organization
    const member = await prisma.member.findFirst({
      where: { userId },
    });

    if (!member) {
      throw new ORPCError('UNAUTHORIZED');
    }

    const organization = await prisma.organization.findFirst({
      where: { id: member.organizationId },
    });

    if (!organization) {
      throw new ORPCError('NOT_FOUND', { message: 'Organization not found' });
    }

    // Only owners can complete onboarding
    if (member.role !== 'owner') {
      throw new ORPCError('FORBIDDEN', { message: 'Only owners can complete onboarding' });
    }

    // Check if organization is in correct state
    if (organization.status !== 'ONBOARDING' && organization.status !== 'IDLE' && organization.status !== 'REJECTED') {
      throw new ORPCError('FORBIDDEN', { message: 'Organization is not in onboarding state' });
    }

    // Get city to find country and validation
    const city = await prisma.city.findFirst({
      where: { code: input.cityCode },
      include: {
        country: {
          include: {
            requiredDocuments: true,
          },
        },
      },
    });

    if (!city) {
      throw new ORPCError('NOT_FOUND', { message: 'City not found' });
    }

    // Validate required documents
    const requiredDocs = city.country.requiredDocuments.filter((doc) => doc.isRequired);
    const providedDocTypes = input.documents?.map((doc) => doc.documentType) || [];

    for (const requiredDoc of requiredDocs) {
      if (!providedDocTypes.includes(requiredDoc.documentType)) {
        throw new ORPCError('BAD_REQUEST', {
          message: `Required document missing: ${requiredDoc.documentType}`,
        });
      }
    }

    // Update organization using transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update organization
      const updatedOrg = await tx.organization.update({
        where: { id: organization.id },
        data: {
          name: input.name,
          slug: input.slug,
          legalName: input.legalName,
          description: input.description,
          logo: input.logo,
          cityId: city.id,
          lat: input.lat || city.lat,
          lng: input.lng || city.lng,
          email: input.email,
          phoneNumber: input.phoneNumber,
          website: input.website || null,
          address: input.address,
          taxId: input.taxId,
          status: 'PENDING', // Set to pending for admin review
          onboardingStep: 5, // Completed all steps
        },
      });

      // Create organization documents if provided
      if (input.documents && input.documents.length > 0) {
        for (const doc of input.documents) {
          await tx.organizationDocument.create({
            data: {
              organizationId: organization.id,
              status: 'PENDING',
              files: {
                create: doc.files.map((file) => ({
                  url: file.url,
                  format: file.format,
                })),
              },
            },
          });
        }
      }

      return updatedOrg;
    });

    return {
      success: true,
      organizationId: result.id,
      status: result.status as 'PENDING' | 'ACTIVE',
    };
  }

  // ============ PARTNER - GET MY ORGANIZATION ============

  static async getMyOrganization(userId: string, locale: string): Promise<GetMyOrganizationOutputType> {
    const member = await prisma.member.findFirst({
      where: { userId },
    });

    if (!member) {
      throw new ORPCError('UNAUTHORIZED', { message: 'No organization membership found' });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: member.organizationId },
      include: {
        city: {
          select: {
            code: true,
            name: true,
            timezone: true,
            country: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            listings: true,
            members: true,
          },
        },
      },
    });

    if (!organization) {
      throw new ORPCError('NOT_FOUND', { message: 'Organization not found' });
    }

    return {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      tagline: organization.tagline,
      logo: organization.logo,
      cover: organization.cover,
      description: organization.description,
      legalName: organization.legalName,
      taxId: organization.taxId,
      email: organization.email,
      phoneNumber: organization.phoneNumber,
      phoneNumberVerified: organization.phoneNumberVerified,
      website: organization.website,
      whatsapp: organization.whatsapp,
      cityId: organization.cityId,
      city: organization.city
        ? {
            code: organization.city.code,
            name: getLocalizedValue(organization.city.name, locale),
            timezone: organization.city.timezone,
            country: {
              code: organization.city.country.code,
              name: getLocalizedValue(organization.city.country.name, locale),
            },
          }
        : null,
      lat: organization.lat,
      lng: organization.lng,
      address: organization.address,
      facebookUrl: organization.facebookUrl,
      instagramUrl: organization.instagramUrl,
      twitterUrl: organization.twitterUrl,
      linkedinUrl: organization.linkedinUrl,
      youtubeUrl: organization.youtubeUrl,
      tiktokUrl: organization.tiktokUrl,
      businessHours: organization.businessHours,
      holidayHours: organization.holidayHours,
      cancellationPolicy: organization.cancellationPolicy,
      lateReturnPolicy: organization.lateReturnPolicy,
      fuelPolicy: organization.fuelPolicy,
      mileagePolicy: organization.mileagePolicy,
      damagePolicy: organization.damagePolicy,
      insurancePolicy: organization.insurancePolicy,
      agePolicy: organization.agePolicy,
      additionalDriverPolicy: organization.additionalDriverPolicy,
      crossBorderPolicy: organization.crossBorderPolicy,
      petPolicy: organization.petPolicy,
      smokingPolicy: organization.smokingPolicy,
      foundedYear: organization.foundedYear,
      certificationsJson: organization.certificationsJson,
      specializations: organization.specializations,
      status: organization.status,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
      memberRole: member.role,
      _count: organization._count,
    };
  }

  // ============ PARTNER - UPDATE BASIC INFO ============

  static async updateBasicInfo(
    userId: string,
    input: UpdateOrgBasicInfoInputType
  ): Promise<UpdateOrgBasicInfoOutputType> {
    const member = await prisma.member.findFirst({
      where: { userId, role: 'owner' },
    });

    if (!member) {
      throw new ORPCError('FORBIDDEN', { message: 'Only owners can update organization' });
    }

    await prisma.organization.update({
      where: { id: member.organizationId },
      data: {
        name: input.name,
        tagline: input.tagline,
        description: input.description,
        foundedYear: input.foundedYear,
        specializations: input.specializations || [],
      },
    });

    return { success: true };
  }

  // ============ PARTNER - UPDATE CONTACT INFO ============

  static async updateContactInfo(
    userId: string,
    input: UpdateOrgContactInfoInputType
  ): Promise<UpdateOrgContactInfoOutputType> {
    const member = await prisma.member.findFirst({
      where: { userId, role: 'owner' },
    });

    if (!member) {
      throw new ORPCError('FORBIDDEN', { message: 'Only owners can update organization' });
    }

    await prisma.organization.update({
      where: { id: member.organizationId },
      data: {
        email: input.email,
        phoneNumber: input.phoneNumber,
        website: input.website || null,
        whatsapp: input.whatsapp,
      },
    });

    return { success: true };
  }

  // ============ PARTNER - UPDATE LOCATION ============

  static async updateLocation(
    userId: string,
    input: UpdateOrgLocationInputType
  ): Promise<UpdateOrgLocationOutputType> {
    const member = await prisma.member.findFirst({
      where: { userId, role: 'owner' },
    });

    if (!member) {
      throw new ORPCError('FORBIDDEN', { message: 'Only owners can update organization' });
    }

    await prisma.organization.update({
      where: { id: member.organizationId },
      data: {
        address: input.address,
        lat: input.lat,
        lng: input.lng,
      },
    });

    return { success: true };
  }

  // ============ PARTNER - UPDATE SOCIAL MEDIA ============
  // Allowed for: owner, admin

  static async updateSocialMedia(
    userId: string,
    input: UpdateOrgSocialMediaInputType
  ): Promise<UpdateOrgSocialMediaOutputType> {
    const member = await prisma.member.findFirst({
      where: { userId, role: { in: ['owner', 'admin'] } },
    });

    if (!member) {
      throw new ORPCError('FORBIDDEN', { message: 'Only owners or admins can update social media' });
    }

    await prisma.organization.update({
      where: { id: member.organizationId },
      data: {
        facebookUrl: input.facebookUrl || null,
        instagramUrl: input.instagramUrl || null,
        twitterUrl: input.twitterUrl || null,
        linkedinUrl: input.linkedinUrl || null,
        youtubeUrl: input.youtubeUrl || null,
        tiktokUrl: input.tiktokUrl || null,
      },
    });

    return { success: true };
  }

  // ============ PARTNER - UPDATE BUSINESS HOURS ============
  // Allowed for: owner, admin

  static async updateBusinessHours(
    userId: string,
    input: UpdateOrgBusinessHoursInputType
  ): Promise<UpdateOrgBusinessHoursOutputType> {
    const member = await prisma.member.findFirst({
      where: { userId, role: { in: ['owner', 'admin'] } },
    });

    if (!member) {
      throw new ORPCError('FORBIDDEN', { message: 'Only owners or admins can update business hours' });
    }

    await prisma.organization.update({
      where: { id: member.organizationId },
      data: {
        businessHours: input.businessHours ?? undefined,
        holidayHours: input.holidayHours ?? undefined,
      },
    });

    return { success: true };
  }

  // ============ PARTNER - UPDATE POLICIES ============
  // Allowed for: owner, admin

  static async updatePolicies(
    userId: string,
    input: UpdateOrgPoliciesInputType
  ): Promise<UpdateOrgPoliciesOutputType> {
    const member = await prisma.member.findFirst({
      where: { userId, role: { in: ['owner', 'admin'] } },
    });

    if (!member) {
      throw new ORPCError('FORBIDDEN', { message: 'Only owners or admins can update policies' });
    }

    await prisma.organization.update({
      where: { id: member.organizationId },
      data: {
        cancellationPolicy: input.cancellationPolicy ?? undefined,
        lateReturnPolicy: input.lateReturnPolicy ?? undefined,
        fuelPolicy: input.fuelPolicy ?? undefined,
        mileagePolicy: input.mileagePolicy ?? undefined,
        damagePolicy: input.damagePolicy ?? undefined,
        insurancePolicy: input.insurancePolicy ?? undefined,
        agePolicy: input.agePolicy ?? undefined,
        additionalDriverPolicy: input.additionalDriverPolicy ?? undefined,
        crossBorderPolicy: input.crossBorderPolicy ?? undefined,
        petPolicy: input.petPolicy ?? undefined,
        smokingPolicy: input.smokingPolicy ?? undefined,
      },
    });

    return { success: true };
  }

  // ============ PARTNER - UPDATE BRANDING ============

  static async updateBranding(
    userId: string,
    input: UpdateOrgBrandingInputType
  ): Promise<UpdateOrgBrandingOutputType> {
    const member = await prisma.member.findFirst({
      where: { userId, role: 'owner' },
    });

    if (!member) {
      throw new ORPCError('FORBIDDEN', { message: 'Only owners can update organization' });
    }

    console.log('🚀 updateBranding called with:', {
      hasLogo: !!input.logo,
      hasCover: !!input.cover,
      logoLength: input.logo?.length,
      coverLength: input.cover?.length,
      logoIsDataUrl: input.logo?.startsWith('data:'),
      coverIsDataUrl: input.cover?.startsWith('data:'),
    });

    // Import cloudinary functions dynamically to avoid circular dependencies
    const { uploadOrganizationLogo, uploadOrganizationCover } = await import('@yayago-app/cloudinary');

    let logoUrl = input.logo;
    let coverUrl = input.cover;

    // If logo is a base64 data URL, upload to Cloudinary
    if (input.logo && input.logo.startsWith('data:')) {
      try {
        console.log('📸 Uploading logo to Cloudinary for org:', member.organizationId);
        const result = await uploadOrganizationLogo(input.logo, member.organizationId);
        logoUrl = result.secure_url;
        console.log('✅ Logo uploaded successfully:', logoUrl);
      } catch (error) {
        console.error('❌ Logo upload error:', error);
        throw new ORPCError('INTERNAL_SERVER_ERROR', { 
          message: `Failed to upload logo: ${error instanceof Error ? error.message : 'Unknown error'}` 
        });
      }
    }

    // If cover is a base64 data URL, upload to Cloudinary
    if (input.cover && input.cover.startsWith('data:')) {
      try {
        console.log('🖼️ Uploading cover to Cloudinary for org:', member.organizationId);
        const result = await uploadOrganizationCover(input.cover, member.organizationId);
        coverUrl = result.secure_url;
        console.log('✅ Cover uploaded successfully:', coverUrl);
      } catch (error) {
        console.error('❌ Cover upload error:', error);
        throw new ORPCError('INTERNAL_SERVER_ERROR', { 
          message: `Failed to upload cover: ${error instanceof Error ? error.message : 'Unknown error'}` 
        });
      }
    }

    console.log('📝 Updating organization with:', { logoUrl: !!logoUrl, coverUrl: !!coverUrl });

    const updated = await prisma.organization.update({
      where: { id: member.organizationId },
      data: {
        ...(logoUrl !== undefined && { logo: logoUrl }),
        ...(coverUrl !== undefined && { cover: coverUrl }),
      },
      select: {
        logo: true,
        cover: true,
      },
    });

    return {
      success: true,
      logo: updated.logo,
      cover: updated.cover,
    };
  }
}
