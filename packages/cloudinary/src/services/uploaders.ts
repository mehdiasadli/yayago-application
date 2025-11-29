import { uploadOptions } from '../options';
import { upload } from './upload';

export async function uploadUserAvatar(file: string | Buffer | File, userId: string) {
  return upload(file, {
    ...uploadOptions.userAvatar,
    public_id: `user_avatar_${userId}`,
    overwrite: true,
  });
}

export async function uploadOrganizationLogo(file: string | Buffer | File, organizationId: string) {
  return upload(file, {
    ...uploadOptions.organizationLogo,
    public_id: `organization_logo_${organizationId}`,
    overwrite: true,
  });
}

export async function uploadOrganizationCover(file: string | Buffer | File, organizationId: string) {
  return upload(file, {
    ...uploadOptions.organizationCover,
    public_id: `organization_cover_${organizationId}`,
    overwrite: true,
  });
}

export async function uploadVehicleBrandLogo(file: string | Buffer | File, vehicleBrandId: string) {
  return upload(file, {
    ...uploadOptions.vehicleBrandLogo,
    public_id: `vehicle_brand_logo_${vehicleBrandId}`,
    overwrite: true,
  });
}

export async function uploadVehicleModelHero(file: string | Buffer | File, vehicleModelId: string) {
  return upload(file, {
    ...uploadOptions.vehicleModelHero,
    public_id: `vehicle_model_hero_${vehicleModelId}`,
    overwrite: true,
  });
}

export async function uploadListingMedia(file: string | Buffer | File, listingId: string) {
  return upload(file, {
    ...uploadOptions.listingMedia,
    public_id: `listing_media_${listingId}`,
    overwrite: true,
  });
}

export async function uploadListingDocument(file: string | Buffer | File, listingId: string) {
  return upload(file, {
    ...uploadOptions.listingDocument,
    public_id: `listing_document_${listingId}`,
    overwrite: true,
  });
}

export async function uploadOrganizationDocument(file: string | Buffer | File, organizationId: string) {
  return upload(file, {
    ...uploadOptions.organizationDocument,
    public_id: `organization_document_${organizationId}`,
    overwrite: true,
  });
}

export async function uploadCityHeroImage(file: string | Buffer | File, cityId: string) {
  return upload(file, {
    ...uploadOptions.cityHeroImage,
    public_id: `city_hero_image_${cityId}`,
    overwrite: true,
  });
}
