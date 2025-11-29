import { NextResponse, type NextRequest } from 'next/server';

const LOCALES_CODES = ['en', 'ar', 'az', 'ru'];
const DEFAULT_LOCALE = 'en';
const DEFAULT_CITY = 'dubai';

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}/${DEFAULT_CITY}`, req.url));
  }

  const segments = pathname.split('/');
  const locale = segments[1];
  const city = segments[2];

  const isLocaleValid = LOCALES_CODES.includes(locale);

  if (!isLocaleValid) {
    // If first segment isn't a locale, assume they missed it: /dubai -> /en/dubai
    // Or if totally wrong, redirect to default
    return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}/${pathname}`, req.url));
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-language-code', locale);

  if (city) {
    requestHeaders.set('x-city-code', city);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
