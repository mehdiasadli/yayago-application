import type { ImageTransformationOptions, UploadApiOptions, VideoTransformationOptions } from 'cloudinary';

export const uploadOptions = {
  // User profile images
  userAvatar: {
    folder: 'yayago/users/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    resource_type: 'image',
    transformation: [
      {
        width: 400,
        height: 400,
        crop: 'fill',
        gravity: 'face',
      },
      {
        quality: 'auto',
        format: 'auto',
      },
    ] as ImageTransformationOptions[],
  },

  // Organization logo images
  organizationLogo: {
    folder: 'yayago/organizations/logos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    resource_type: 'image',
    transformation: [
      {
        width: 400,
        height: 400,
        crop: 'fill',
      },
      {
        quality: 'auto',
        format: 'auto',
      },
    ] as ImageTransformationOptions[],
  },

  // organization cover images
  organizationCover: {
    folder: 'yayago/organizations/covers',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    resource_type: 'image',
    transformation: [
      {
        width: 1200,
        crop: 'limit',
      },
      {
        quality: 'auto',
        format: 'auto',
      },
    ] as ImageTransformationOptions[],
  },

  // Vehicle brand logo images
  vehicleBrandLogo: {
    folder: 'yayago/vehicles/brands/logos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    resource_type: 'image',
    transformation: [
      {
        width: 400,
        height: 400,
        crop: 'fill',
      },
      {
        quality: 'auto',
        format: 'auto',
      },
    ] as ImageTransformationOptions[],
  },

  // Vehicle model hero images
  vehicleModelHero: {
    folder: 'yayago/vehicles/models/heroes',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    resource_type: 'image',
    transformation: [
      {
        width: 1200,
        crop: 'limit',
      },
    ] as ImageTransformationOptions[],
  },

  // listing medias (images/videos)
  listingMedia: {
    folder: 'yayago/listings/media',
    allowed_formats: [
      // image
      'jpg',
      'jpeg',
      'png',
      'webp',
      // video
      'mp4',
      'webm',
      'mov',
      'avi',
    ],
    resource_type: 'auto',
    transformation: [
      {
        width: 1200,
        crop: 'limit',
      },
      {
        quality: 'auto',
        format: 'auto',
      },
    ] as (ImageTransformationOptions | VideoTransformationOptions)[],
  },

  // listing documents
  listingDocument: {
    folder: 'yayago/listings/documents',
    allowed_formats: ['pdf', 'docx', 'jpeg', 'png'],
    resource_type: 'auto',
  },

  // organization documents
  organizationDocument: {
    folder: 'yayago/organizations/documents',
    allowed_formats: ['pdf', 'docx', 'jpeg', 'png'],
    resource_type: 'auto',
  },

  // city hero image
  cityHeroImage: {
    folder: 'yayago/cities/heroes',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    resource_type: 'image',
    transformation: [
      {
        width: 1200,
        crop: 'limit',
      },
    ] as ImageTransformationOptions[],
  },

  // Driver license images (private - no transformation to preserve document quality)
  driverLicense: {
    folder: 'yayago/users/driver-licenses',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    resource_type: 'auto',
    type: 'private', // Private upload for sensitive documents
  },
} as const satisfies Record<string, UploadApiOptions>;
