export type GetOptimizedUrlOptions = {
  width?: number;
  height?: number;
  crop?: 'fill' | 'limit' | 'scale' | 'fit' | 'pad';
  gravity?: 'face' | 'center' | 'auto';
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
};

export async function getOptimizedUrl(publicId: string, options: GetOptimizedUrlOptions = {}) {
  const { width, height, crop = 'limit', gravity = 'center', quality = 'auto', format = 'auto' } = options;

  let transformation = `q_${quality},f_${format}`;

  if (width || height) {
    transformation += `,c_${crop}`;

    if (width) transformation += `,w_${width}`;
    if (height) transformation += `,h_${height}`;
    if (crop === 'fill' && gravity) transformation += `,g_${gravity}`;
  }

  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${transformation}/${publicId}`;
}
