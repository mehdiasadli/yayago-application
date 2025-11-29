export function generateSlug(title: string, id?: string): string {
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  // Append short ID suffix for uniqueness if provided
  return id ? `${baseSlug}-${id.slice(0, 8)}` : baseSlug;
}

export function validateTags(tags: string[]): boolean {
  if (tags.length > 20) return false;
  return tags.every(tag => tag.length > 0 && tag.length <= 50);
}

export function canTransitionStatus(
  currentStatus: string,
  newStatus: string
): boolean {
  const transitions: Record<string, string[]> = {
    DRAFT: ['AVAILABLE', 'ARCHIVED'],
    AVAILABLE: ['UNAVAILABLE', 'MAINTENANCE', 'ARCHIVED'],
    UNAVAILABLE: ['AVAILABLE', 'MAINTENANCE', 'ARCHIVED'],
    MAINTENANCE: ['AVAILABLE', 'UNAVAILABLE', 'ARCHIVED'],
    LOST_OR_STOLEN: ['ARCHIVED'],
    ARCHIVED: ['DRAFT'],
    BLOCKED: [], // Cannot transition from blocked (admin only)
  };

  return transitions[currentStatus]?.includes(newStatus) ?? false;
}

