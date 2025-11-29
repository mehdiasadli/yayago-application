import { authClient } from '@/lib/auth-client';
import AuthLayoutWrapper from './layout-wrapper';
import { headers } from 'next/headers';
import { redirect } from '@/lib/navigation/navigation-server';

export default async function AuthLayout({ children, params }: LayoutProps<'/[locale]/[city]'>) {
  const { locale, city } = await params;
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (session.data?.user) {
    redirect('/', { locale, city });
    return;
  }

  return <AuthLayoutWrapper>{children}</AuthLayoutWrapper>;
}
