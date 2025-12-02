import { isCloudinaryUrl, uploadUserAvatar } from '@yayago-app/cloudinary';

// GOOGLE
const hostnames = [/\w+\.googleusercontent\.com/i];

export async function uploadAvatarFromSocialProfile(userId: string, url?: string | null) {
  if (!url) return null;

  // check if url is cloudinary url
  if (isCloudinaryUrl(url)) {
    return url;
  }

  // validate if it is valid url
  if (!isValidUrl(url)) {
    return null;
  }

  const result = await uploadUserAvatar(url, userId);

  return result.secure_url;
}

function isValidUrl(url: string) {
  try {
    const urlObject = new URL(url);

    if (urlObject.protocol !== 'https:') return false;

    return hostnames.some((host) => urlObject.hostname.match(host));
  } catch (error) {
    return false;
  }
}
