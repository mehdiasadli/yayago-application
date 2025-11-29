export const DEFAULT_LOCALE_CODE = 'en';
export const DEFAULT_CITY_CODE = 'dubai';
export const DEFAULT_COUNTRY_CODE = 'ae';

export const LOCALES = {
  en: {
    code: 'en',
    name: 'English',
    dir: 'ltr',
  },
  ar: {
    code: 'ar',
    name: 'العربية',
    dir: 'rtl',
  },
  az: {
    code: 'az',
    name: 'Azərbaycanca',
    dir: 'ltr',
  },
  ru: {
    code: 'ru',
    name: 'Русский',
    dir: 'ltr',
  },
} as const;

export const CITIES = {
  dubai: {
    code: 'dubai',
    name: 'Dubai',
    country: 'ae',
    names: {
      en: 'Dubai',
      ar: 'دبي',
      az: 'Dubay',
      ru: 'Дубай',
    },
  },
  'abu-dhabi': {
    code: 'abu-dhabi',
    name: 'Abu Dhabi',
    country: 'ae',
    names: {
      en: 'Abu Dhabi',
      ar: 'أبو ظبي',
      az: 'Abu Dhabi',
      ru: 'Абу-Даби',
    },
  },
  baku: {
    code: 'baku',
    name: 'Baku',
    country: 'az',
    names: {
      en: 'Baku',
      ar: 'باكو',
      az: 'Baku',
      ru: 'Баку',
    },
  },
} as const;

const COUNTRIES = {
  ae: {
    code: 'ae',
    name: 'United Arab Emirates',
    names: {
      en: 'United Arab Emirates',
      ar: 'الإمارة العربية المتحدة',
      az: 'Bükəristan',
      ru: 'ОАЭ',
    },
  },
  az: {
    code: 'az',
    name: 'Azerbaijan',
    names: {
      en: 'Azerbaijan',
      ar: 'أذربيجان',
      az: 'Bələcər',
      ru: 'Азербайджан',
    },
  },
} as const;

export const getDefaultLocale = () => {
  return LOCALES[DEFAULT_LOCALE_CODE as keyof typeof LOCALES] || LOCALES.en;
};

export const getDefaultCity = () => {
  return CITIES[DEFAULT_CITY_CODE as keyof typeof CITIES] || CITIES.dubai;
};

export const getDefaultCountry = () => {
  return COUNTRIES[DEFAULT_COUNTRY_CODE as keyof typeof COUNTRIES] || COUNTRIES.ae;
};

export function getLocale(code: string) {
  return LOCALES[code as keyof typeof LOCALES] || getDefaultLocale();
}

export function getCountry(code: string) {
  return COUNTRIES[code as keyof typeof COUNTRIES] || getDefaultCountry();
}

export function getCity(code: string) {
  return CITIES[code as keyof typeof CITIES] || getDefaultCity();
}

export function getCitiesOfCountry(countryCode: string) {
  return Object.values(CITIES).filter((city) => city.country === countryCode);
}

export function getCountryByCityCode(cityCode: string) {
  const countryCode = Object.values(CITIES).find((city) => city.code === cityCode)?.country;
  return countryCode ? getCountry(countryCode) : null;
}

export type LocaleCode = keyof typeof LOCALES;
export type CityCode = keyof typeof CITIES;
