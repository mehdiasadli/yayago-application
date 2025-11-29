import type { ZLocalizedInput } from '@yayago-app/i18n';

export function paginate<T>(items: T[], page: number, take: number, total: number) {
  return {
    items,
    pagination: {
      page,
      take,
      total,
      totalPages: Math.ceil(total / take),
    },
  };
}

export function getPagination(input: { page: number; take: number }) {
  return {
    skip: (input.page - 1) * input.take,
    take: input.take,
  };
}

export function getLocalizedValue(data: unknown, locale?: string): string {
  if (!data || typeof data !== 'object' || !('en' in data)) return '';

  const translations = data as Record<string, string>;
  if (!locale) return translations.en || '';
  if (translations[locale]) return translations[locale]!;
  if (translations.en) return translations.en;
  return Object.values(translations)[0] || '';
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const slugRegex = /^[a-z0-9-]+$/;

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateLookup(...input: ZLocalizedInput[]): string[] {
  return input
    .map((item) =>
      [item.en?.toLowerCase(), item.az?.toLowerCase(), item.ru?.toLowerCase(), item.ar?.toLowerCase()].filter(Boolean)
    )
    .flat()
    .filter(Boolean) as string[];
}
