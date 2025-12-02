import { cloudinary } from '../config';

/**
 * Generate a signed URL for a private/authenticated Cloudinary resource.
 * The URL will expire after the specified duration.
 *
 * @param publicId - The public_id of the resource (can be extracted from the stored URL)
 * @param options - Options for URL generation
 * @returns Signed URL with expiration
 */
export function generateSignedUrl(
  publicId: string,
  options: {
    expiresInSeconds?: number;
    resourceType?: 'image' | 'video' | 'raw';
    type?: 'private' | 'authenticated' | 'upload';
    transformation?: Record<string, any>;
  } = {}
): string {
  const { expiresInSeconds = 300, resourceType = 'image', type = 'private', transformation } = options;

  // Calculate expiration timestamp (Unix timestamp)
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;

  return cloudinary.url(publicId, {
    sign_url: true,
    type,
    resource_type: resourceType,
    expires_at: expiresAt,
    secure: true,
    ...(transformation && { transformation }),
  });
}

/**
 * Extract public_id from a Cloudinary URL.
 * This is useful when we've stored the full URL but need the public_id for signed URL generation.
 *
 * @param url - The Cloudinary URL
 * @returns The public_id
 */
export function extractPublicIdFromUrl(url: string): string | null {
  if (!url) return null;

  try {
    // Parse the URL
    const urlObj = new URL(url);

    // Cloudinary URLs have the format:
    // https://res.cloudinary.com/{cloud_name}/image/{type}/v{version}/{folder}/{public_id}.{format}
    // or with signature:
    // https://res.cloudinary.com/{cloud_name}/image/{type}/s--{signature}--/v{version}/{folder}/{public_id}.{format}

    const pathParts = urlObj.pathname.split('/');

    // Find the version (starts with 'v' followed by numbers) and everything after it is the path
    let versionIndex = -1;
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      if (part && /^v\d+$/.test(part)) {
        versionIndex = i;
        break;
      }
    }

    if (versionIndex === -1) {
      // Try to find the path after 'private', 'authenticated', or 'upload'
      const typeIndex = pathParts.findIndex((p) => ['private', 'authenticated', 'upload'].includes(p));
      if (typeIndex !== -1) {
        versionIndex = typeIndex + 1;
      }
    }

    if (versionIndex === -1) {
      return null;
    }

    // Get everything after version as the public_id (including folder)
    const publicIdWithExtension = pathParts.slice(versionIndex + 1).join('/');

    // Remove file extension
    const lastDotIndex = publicIdWithExtension.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      return publicIdWithExtension.substring(0, lastDotIndex);
    }

    return publicIdWithExtension;
  } catch (error) {
    console.error('Error extracting public_id from URL:', error);
    return null;
  }
}

/**
 * Generate a signed URL from a stored Cloudinary URL.
 * This extracts the public_id and generates a new signed URL with expiration.
 *
 * @param storedUrl - The URL stored in the database
 * @param options - Options for URL generation
 * @returns Signed URL with expiration, or null if extraction fails
 */
export function generateSignedUrlFromStoredUrl(
  storedUrl: string,
  options: {
    expiresInSeconds?: number;
    resourceType?: 'image' | 'video' | 'raw';
    transformation?: Record<string, any>;
  } = {}
): string | null {
  const publicId = extractPublicIdFromUrl(storedUrl);
  if (!publicId) {
    return null;
  }

  return generateSignedUrl(publicId, {
    ...options,
    type: 'private',
  });
}
