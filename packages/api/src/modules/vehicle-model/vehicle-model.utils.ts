export function generateSlug(name: string, brandSlug?: string): string {
  const nameSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

  // If brand slug is provided, prepend it for better SEO
  return brandSlug ? `${brandSlug}-${nameSlug}` : nameSlug;
}

