import { cloudinary } from '../config';

export async function deleteFile(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new Error('Failed to delete the file');
  }
}
