import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEnumValue(value: string): string {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function formatCurrency(amount: number, currency: string = 'AED'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return formatter.format(amount);
}

/**
 * Get localized value from a Record<string, string> object
 * Falls back to 'en' locale, then first available value
 */
export function getLocalizedValue(
  value: Record<string, string> | null | undefined,
  locale = 'en'
): string {
  if (!value) return '';
  return value[locale] || value['en'] || Object.values(value)[0] || '';
}
