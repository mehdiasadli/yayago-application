import type { UploadApiOptions, UploadApiResponse } from 'cloudinary';
import { cloudinary } from '../config';

export type UploadResult = Pick<
  UploadApiResponse,
  'public_id' | 'secure_url' | 'url' | 'width' | 'height' | 'bytes' | 'format' | 'original_filename' | 'resource_type'
>;

export async function upload(
  file: string | Buffer | File,
  options: Partial<UploadApiOptions> = {}
): Promise<UploadResult> {
  try {
    const result = await cloudinary.uploader.upload(file as string, {
      folder: options.folder || 'yayago/general',
      allowed_formats: options.allowed_formats || ['jpg', 'jpeg', 'png', 'webp'],
      transformation: options.transformation,
      resource_type: options.resource_type || 'auto',
      public_id: options.public_id,
      overwrite: options.overwrite ?? false,
      unique_filename: options.unique_filename ?? true,
      ...options,
    });

    const { public_id, secure_url, url, width, height, bytes, format, original_filename, resource_type } = result;

    return {
      public_id,
      secure_url,
      url,
      width,
      height,
      bytes,
      format,
      original_filename,
      resource_type,
    };
  } catch (error) {
    throw new Error('Fialed to upload file');
  }
}
