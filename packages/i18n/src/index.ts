import { en } from './locales/en';
import { az } from './locales/az';
import { ar } from './locales/ar';
import { ru } from './locales/ru';

import { type ZLocalizedInput } from './lib/localized.schema';
import { zLocalized } from './lib/localized.schema';

export const locales = {
  az,
  en,
  ar,
  ru,
};

export const DEFAULT_LOCALE = 'en';
export const LOCALES = ['en', 'az', 'ar', 'ru'] as const;

export type Locale = keyof typeof locales;
export type Translations = typeof en;

export type { ZLocalizedInput };
export { zLocalized };

export const getDictionary = (lang: string) => {
  return locales[lang as Locale] || locales.en;
};
