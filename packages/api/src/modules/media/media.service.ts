import prisma from '@yayago-app/db';
import cloudinary, { upload as cloudinaryUpload } from '@yayago-app/cloudinary';
import { ORPCError } from '@orpc/client';
import type {
  UploadMediaInputType,
  UploadMediaOutputType,
  ConfirmMediaUploadInputType,
  ConfirmMediaUploadOutputType,
  ServerUploadMediaInputType,
  ServerUploadMediaOutputType,
} from '@yayago-app/validators';

/**
 * Gets the user's organization context
 */
async function getOrganizationContext(userId: string) {
  const member = await prisma.member.findFirst({
    where: { userId },
    include: {
      organization: {
        include: {
          subscriptions: {
            where: { status: { in: ['active', 'trialing'] } },
            take: 1,
          },
        },
      },
    },
  });

  if (!member || !member.organization) {
    throw new ORPCError('FORBIDDEN', { message: 'You must belong to an organization' });
  }

  if (member.organization.status !== 'APPROVED') {
    throw new ORPCError('FORBIDDEN', { message: 'Your organization must be approved' });
  }

  const subscription = member.organization.subscriptions[0];
  if (!subscription || subscription.status !== 'active') {
    throw new ORPCError('FORBIDDEN', { message: 'You must have an active subscription' });
  }

  return {
    organizationId: member.organization.id,
    subscription,
  };
}

/**
 * Verifies that the listing belongs to the user's organization
 */
async function verifyListingOwnership(listingSlug: string, organizationId: string) {
  const listing = await prisma.listing.findFirst({
    where: {
      slug: listingSlug,
      organizationId,
    },
  });

  if (!listing) {
    throw new ORPCError('NOT_FOUND', { message: 'Listing not found or does not belong to your organization' });
  }

  return listing;
}

/**
 * Generates a signed upload URL for direct client-side upload to Cloudinary
 */
export async function generateUploadSignature(
  input: UploadMediaInputType,
  userId: string
): Promise<UploadMediaOutputType> {
  const { organizationId } = await getOrganizationContext(userId);

  // If listing slug is provided, verify ownership
  if (input.listingSlug) {
    await verifyListingOwnership(input.listingSlug, organizationId);
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = input.listingSlug
    ? `yayago/listings/${organizationId}/${input.listingSlug}`
    : `yayago/listings/${organizationId}/temp`;

  // Generate upload parameters
  const uploadParams: Record<string, string | number> = {
    timestamp,
    folder,
    upload_preset: 'ml_default', // You may want to configure this
  };

  // Generate signature
  const signature = cloudinary.utils.api_sign_request(uploadParams, process.env.CLOUDINARY_API_SECRET!);

  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${input.mediaType === 'VIDEO' ? 'video' : 'image'}/upload`,
    publicId: `${folder}/${Date.now()}-${input.fileName.replace(/\.[^/.]+$/, '')}`,
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    folder,
  };
}

/**
 * Confirms a media upload and saves it to the database
 */
export async function confirmUpload(
  input: ConfirmMediaUploadInputType,
  userId: string
): Promise<ConfirmMediaUploadOutputType> {
  const { organizationId, subscription } = await getOrganizationContext(userId);
  const listing = await verifyListingOwnership(input.listingSlug, organizationId);

  // Check media limits
  const existingMediaCount = await prisma.listingMedia.count({
    where: {
      listingId: listing.id,
      type: input.mediaType,
    },
  });

  if (input.mediaType === 'IMAGE') {
    const maxImages = subscription.maxImagesPerListing || 10;
    if (existingMediaCount >= maxImages) {
      throw new ORPCError('BAD_REQUEST', {
        message: `Maximum ${maxImages} images allowed per listing`,
      });
    }
  }

  if (input.mediaType === 'VIDEO') {
    const maxVideos = subscription.maxVideosPerListing || 2;
    if (existingMediaCount >= maxVideos) {
      throw new ORPCError('BAD_REQUEST', {
        message: `Maximum ${maxVideos} videos allowed per listing`,
      });
    }
  }

  // If this is primary, unset existing primary
  if (input.isPrimary) {
    await prisma.listingMedia.updateMany({
      where: {
        listingId: listing.id,
        isPrimary: true,
      },
      data: {
        isPrimary: false,
      },
    });
  }

  // Get display order
  const maxOrder = await prisma.listingMedia.aggregate({
    where: { listingId: listing.id },
    _max: { displayOrder: true },
  });

  // Create media record
  const media = await prisma.listingMedia.create({
    data: {
      listingId: listing.id,
      type: input.mediaType,
      url: input.url,
      publicId: input.publicId,
      width: input.width,
      height: input.height,
      size: input.size,
      mimeType: input.format,
      isPrimary: input.isPrimary,
      alt: input.alt,
      displayOrder: (maxOrder._max.displayOrder || 0) + 1,
      status: 'ACTIVE',
      verificationStatus: 'PENDING',
    },
  });

  return {
    id: media.id,
    url: media.url,
    isPrimary: media.isPrimary,
  };
}

/**
 * Server-side upload for media (used when client sends base64 data)
 */
export async function serverUpload(
  input: ServerUploadMediaInputType,
  userId: string
): Promise<ServerUploadMediaOutputType> {
  const { organizationId, subscription } = await getOrganizationContext(userId);
  const listing = await verifyListingOwnership(input.listingSlug, organizationId);

  // Check media limits
  const existingMediaCount = await prisma.listingMedia.count({
    where: {
      listingId: listing.id,
      type: input.mediaType,
    },
  });

  if (input.mediaType === 'IMAGE') {
    const maxImages = subscription.maxImagesPerListing || 10;
    if (existingMediaCount >= maxImages) {
      throw new ORPCError('BAD_REQUEST', {
        message: `Maximum ${maxImages} images allowed per listing`,
      });
    }
  }

  if (input.mediaType === 'VIDEO') {
    const maxVideos = subscription.maxVideosPerListing || 2;
    if (existingMediaCount >= maxVideos) {
      throw new ORPCError('BAD_REQUEST', {
        message: `Maximum ${maxVideos} videos allowed per listing`,
      });
    }
  }

  // Upload to Cloudinary
  const folder = `yayago/listings/${organizationId}/${input.listingSlug}`;
  const resourceType = input.mediaType === 'VIDEO' ? 'video' : 'image';

  const uploadResult = await cloudinaryUpload(input.dataUrl, {
    folder,
    resource_type: resourceType,
    allowed_formats:
      input.mediaType === 'VIDEO' ? ['mp4', 'mov', 'webm', 'avi'] : ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  });

  // If this is primary, unset existing primary
  if (input.isPrimary) {
    await prisma.listingMedia.updateMany({
      where: {
        listingId: listing.id,
        isPrimary: true,
      },
      data: {
        isPrimary: false,
      },
    });
  }

  // Get display order
  const maxOrder = await prisma.listingMedia.aggregate({
    where: { listingId: listing.id },
    _max: { displayOrder: true },
  });

  // Create media record
  const media = await prisma.listingMedia.create({
    data: {
      listingId: listing.id,
      type: input.mediaType,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      width: uploadResult.width || 0,
      height: uploadResult.height || 0,
      size: uploadResult.bytes || 0,
      mimeType: uploadResult.format || 'unknown',
      isPrimary: input.isPrimary,
      alt: input.alt,
      displayOrder: (maxOrder._max.displayOrder || 0) + 1,
      status: 'ACTIVE',
      verificationStatus: 'PENDING',
    },
  });

  return {
    id: media.id,
    url: media.url,
    width: media.width,
    height: media.height,
    isPrimary: media.isPrimary,
  };
}

export const MediaService = {
  generateUploadSignature,
  confirmUpload,
  serverUpload,
};

