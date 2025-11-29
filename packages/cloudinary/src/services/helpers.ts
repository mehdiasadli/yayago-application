export function extractPublicId(cloudinaryUrl: string): string | null {
  try {
    const match = cloudinaryUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);

    if (match?.[1]) return match[1];

    return null;
  } catch (error) {
    return null;
  }
}

export function isCloudinaryUrl(url: string): boolean {
  return url.includes('cloudinary.com') && url.includes('/upload/');
}
