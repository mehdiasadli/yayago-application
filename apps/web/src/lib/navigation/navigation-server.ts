import { redirect as nextRedirect } from 'next/navigation';

export function redirect(path: string, params: { locale: string; city: string }) {
  const { locale, city } = params;
  return nextRedirect(`/${locale}/${city}${path === '/' ? '' : path}`);
}
