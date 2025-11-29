'use client';

import LinkNext from 'next/link';
import {
  useParams as useNextParams,
  usePathname as useNextPathname,
  useRouter as useNextRouter,
} from 'next/navigation';
import { useMemo } from 'react';
import { LocaleCode, CityCode } from './utils';

export const useLocale = () => {
  const params = useNextParams();
  return (params.locale as LocaleCode) || 'en';
};

export const useCity = () => {
  const params = useNextParams();
  return (params.city as string) || 'dubai';
};

export const useParams = () => {
  return useNextParams() as { locale: LocaleCode; city: CityCode; [key: string]: string | string[] };
};

export const usePathnameWithoutLocale = () => {
  const pathname = useNextPathname();
  const locale = useLocale();
  const city = useCity();

  // Remove the prefix `/${locale}/${city}`
  const prefix = `/${locale}/${city}`;

  if (pathname.startsWith(prefix)) {
    const newPath = pathname.replace(prefix, '');
    return newPath === '' ? '/' : newPath;
  }

  // Fallback for edge cases
  return pathname;
};

type LinkProps = Omit<React.ComponentProps<typeof LinkNext>, 'href'> & {
  href: string;
  locale?: LocaleCode; // Optional: Force switch language
  city?: CityCode; // Optional: Force switch city
};

export const Link = ({ href, locale, city, ...props }: LinkProps) => {
  const currentLocale = useLocale();
  const currentCity = useCity();

  const targetLocale = locale || currentLocale;
  const targetCity = city || currentCity;

  // Handle external links or hash links
  let finalHref = href;

  if (typeof href === 'string' && href.startsWith('/')) {
    // Construct: /en/dubai/search
    finalHref = `/${targetLocale}/${targetCity}${href === '/' ? '' : href}`;
  }

  return <LinkNext href={finalHref as any} {...props} />;
};

export const useRouter = () => {
  const router = useNextRouter();
  const currentLocale = useLocale();
  const currentCity = useCity();

  return useMemo(() => {
    const resolveUrl = (href: string, options?: { locale?: LocaleCode; city?: CityCode }) => {
      if (href.startsWith('/')) {
        const targetLocale = options?.locale || currentLocale;
        const targetCity = options?.city || currentCity;
        return `/${targetLocale}/${targetCity}${href === '/' ? '' : href}`;
      }
      return href;
    };

    return {
      ...router,
      push: (href: string, options?: { locale?: LocaleCode; city?: CityCode } & Parameters<typeof router.push>[1]) => {
        return router.push(resolveUrl(href, options) as any, options);
      },
      replace: (
        href: string,
        options?: { locale?: LocaleCode; city?: CityCode } & Parameters<typeof router.replace>[1]
      ) => {
        return router.replace(resolveUrl(href, options) as any, options);
      },
    };
  }, [router, currentLocale, currentCity]);
};

export const useAbsoluteUrl = () => {
  const locale = useLocale();
  const city = useCity();

  // Returns a function that generates the full URL
  return (path: string, options?: { locale?: LocaleCode; city?: CityCode }) => {
    if (typeof window === 'undefined') return '';

    const targetLocale = options?.locale || locale;
    const targetCity = options?.city || city;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    return `${window.location.origin}/${targetLocale}/${targetCity}${cleanPath}`;
  };
};

export const usePathWithLocaleAndCity = () => {
  const locale = useLocale();
  const city = useCity();

  return (path: string) => {
    if (typeof window === 'undefined') return '';

    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    return `/${locale}/${city}${cleanPath}`;
  };
};
